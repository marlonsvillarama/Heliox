/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Library Module for the Invoice record type.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/03/17           Initial version
 * 
 */

define(
    [
        'N/email',
        'N/log',
        'N/record',
        'N/render',
        'N/search',
        'N/ui/serverWidget',
        'N/url',

        './bm_mod_customer',
        './bm_mod_invoice',
        './bm_mod_email_reminder'
    ],
    (
        email,
        log,
        record,
        render,
        search,
        sw,
        url,

        Customer,
        Invoice,
        EmailReminder
    ) => {
        const addBackendUrlField = (options) => {
            let title = 'addBackendUrlField';
            let context = options.context;
            let form = context.form;

            if (context.type != 'view') {
                log.audit({
                    title: title,
                    details: `Invalid event type ${context.type}. Exiting...`
                });
                return;
            }

            let urlBackend = url.resolveScript({
                scriptId: 'customscript_sl_invoice_email',
                deploymentId: 'customdeploy_sl_invoice_email'
            });
            log.debug({
                title: title,
                details: `Backend URL = ${urlBackend}`
            });

            let urlField = form.addField({
                id: Invoice.Fields.backendUrl,
                label: ' ',
                type: 'inlinehtml'
            });
            urlField.defaultValue = urlBackend;
            urlField.updateDisplayType({
                displayType: sw.FieldDisplayType.HIDDEN
            });
        };

        const addSendEmailButton = (options) => {
            let title = 'addSendEmailButton'
            let context = options.context;
            let thisRecord = context.newRecord;
            let form = context.form;

            if (context.type != 'view') {
                log.audit({
                    title: title,
                    details: `Invalid event type ${context.type}. Exiting...`
                });
                return;
            }

            let buttonLabel = 'Email Invoice to Customer';
            let searchReminders = search.create({
                type: EmailReminder.type,
                filters: [
                    [ 'isinactive', 'is', false ],
                    'AND',
                    [ EmailReminder.Fields.invoice, 'anyof', thisRecord.id ]
                ]
            });
            let resultReminders = searchReminders.run().getRange({
                start: 0,
                end: 1
            });
            if (resultReminders.length > 0) {
                buttonLabel = 'Resend Invoice to Customer'
            }

            form.addButton({
                id: 'custpage_btn_sendemail',
                label: buttonLabel,
                functionName: 'emailInvoice'
            });
            form.clientScriptModulePath = './bm_cs_invoice';
        };

        const sendEmail = (options) => {
            let title = 'sendEmail';
            log.debug({
                title: title,
                details: JSON.stringify(options)
            });

            let lookupInvoice = search.lookupFields({
                type: Invoice.Type,
                id: options.invoice,
                columns: [
                    Invoice.Fields.customer,
                    Invoice.Fields.salesRep,
                    Invoice.Fields.transactionNumber
                ]
            });
            log.debug({
                title: `${title} lookupInvoice`,
                details: JSON.stringify(lookupInvoice)
            });

            let lookupCustomer = search.lookupFields({
                type: Customer.Type,
                id: lookupInvoice[Invoice.Fields.customer][0].value,
                columns: [
                    Customer.Fields.companyName,
                    Customer.Fields.email,
                    Customer.Fields.emailRecipients
                ]
            });
            log.debug({
                title: `${title} lookupCustomer`,
                details: JSON.stringify(lookupCustomer)
            });

            let lookupSalesRep = [];
            let salesRep = lookupInvoice[Invoice.Fields.salesRep];
            let salesRepEmail = [];
            if (salesRep[0].value) {
                lookupSalesRep = search.lookupFields({
                    type: 'employee',
                    id: salesRep[0].value,
                    columns: [
                        'email'
                    ]
                });
                log.debug({
                    title: `${title} lookupSalesRep`,
                    details: JSON.stringify(lookupSalesRep)
                });

                if (lookupSalesRep.email) {
                    salesRepEmail.push(lookupSalesRep.email);
                }
            }

            let emailRecipients = [];
            emailRecipients.push(lookupCustomer[Customer.Fields.email]);

            let ccAddresses = lookupCustomer[Customer.Fields.emailRecipients];
            if (ccAddresses) {
                let delimiter = '';
                
                if (ccAddresses.indexOf('\r') >= 0) {
                    delimiter += '\r';
                }

                if (ccAddresses.indexOf('\n') >= 0) {
                    delimiter += '\n';
                }
                log.debug({
                    title: `${title} delimiter`,
                    details: delimiter
                });

                if (delimiter != '') {
                    emailRecipients = emailRecipients.concat(ccAddresses.split(delimiter));
                }
                else {
                    emailRecipients = emailRecipients.concat(ccAddresses);
                }
            }
            log.debug({
                title: `${title} emailRecipients`,
                details: JSON.stringify(emailRecipients)
            });

            if (emailRecipients.length <= 0) {
                return {
                    status: 0,
                    message: `Missing invoice email recipients.`
                };
            }

            let mergeResult = render.mergeEmail({
                templateId: options.template,
                transactionId: Number.parseFloat(options.invoice)
            });
            log.debug({
                title: `${title} mergeResult`,
                details: JSON.stringify(mergeResult)
            });

            let emailValues = {
                body: mergeResult.body.replace('{customer}', lookupCustomer[Customer.Fields.companyName]),
                cc: salesRepEmail,
                invoice: options.invoice,
                invoiceNumber: lookupInvoice[Invoice.Fields.transactionNumber],
                recipients: emailRecipients,
                sender: options.sender,
                subject: mergeResult.subject.replace('{customer}', lookupCustomer[Customer.Fields.companyName])
            };
            log.debug({
                title: `${title} emailValues`,
                details: JSON.stringify(emailValues)
            });

            
            return deliverEmail(emailValues);
        };

        const deliverEmail = (options) => {
            let title = 'deliverEmail';
            let invoicePdf = render.transaction({
                entityId: Number.parseFloat(options.invoice)
            });

            let returnValue = {};
            try {
                let emailObject = {
                    author: options.sender,
                    body: options.body,
                    recipients: options.recipients,
                    subject: options.subject,
                    cc: options.cc,
                    relatedRecords: {
                        transactionId: options.invoice
                    }
                };
                log.debug({
                    title: `${title} emailObject`,
                    details: JSON.stringify(emailObject)
                });

                emailObject.attachments = [ invoicePdf ];
                email.send(emailObject);

                emailObject.invoiceNumber = options.invoiceNumber;
                returnValue = createEmailReminder(emailObject);
                log.debug({
                    title: `${title} returnValue`,
                    details: JSON.stringify(returnValue)
                });
            }
            catch (ex) {
                log.error({
                    title: title,
                    details: ex.toString()
                });
                returnValue = {
                    status: 0,
                    message: ex.message || ex.toString()
                };
            }

            return returnValue;
        };

        const createEmailReminder = (options) => {
            let title = 'createEmailReminder';
            let fields = EmailReminder.Fields;
            let emailReminder = record.create({
                type: EmailReminder.type
            });
            emailReminder.setValue({
                fieldId: fields.invoice,
                value: options.relatedRecords.transactionId
            });
            emailReminder.setValue({
                fieldId: fields.author,
                value: options.author
            });
            emailReminder.setValue({
                fieldId: fields.subject,
                value: options.subject
            });
            emailReminder.setValue({
                fieldId: fields.body,
                value: options.body
            });
            emailReminder.setValue({
                fieldId: fields.recipients,
                value: options.recipients.join(', ')
            });
            emailReminder.setValue({
                fieldId: fields.cc,
                value: options.cc.join(', ')
            });

            try {
                emailReminder.save();
                let msg = `Email sent successfully for Invoice ${options.invoiceNumber}.`;
                log.debug({
                    title: title,
                    message: msg
                });

                return {
                    status: 1,
                    message: msg
                };
            }
            catch (ex) {
                log.error({
                    title: title,
                    details: ex.toString()
                });

                return {
                    status: 0,
                    message: ex.message || ex.toString()
                };
            }
        }

        return {
            AddBackendUrlField: addBackendUrlField,
            AddSendEmailButton: addSendEmailButton,
            DeliverEmail: deliverEmail,
            SendEmail: sendEmail
        };
    }
);