/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Scheduled script to send AR emails for overdue invoices.
 * 
 * @NApiVersion         2.1
 * @NScriptType         MapReduceScript
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/04/06           Initial version
 * 
 */

define(
    [
        'N/https',
        'N/log',
        'N/runtime',
        'N/search',

        './bm_lib_invoice'
    ],
    (
        https,
        log,
        runtime,
        search,

        Invoice
    ) => {
        const getInputData = () => {
            let title = 'getInputData';
            let scriptParams = getScriptParameters();

            if (!scriptParams.SearchInvoices) {
                log.error({
                    title: title,
                    details: `Missing required parameter: Invoice saved search. Exiting...`
                });

                return;
            }

            if (!scriptParams.EmailSender) {
                log.error({
                    title: title,
                    details: `Missing required parameter: Email sender. Exiting...`
                });

                return;
            }

            if (!scriptParams.EmailTemplate) {
                log.error({
                    title: title,
                    details: `Missing required parameter: Email template. Exiting...`
                });

                return;
            }
            
            let searchInvoices = search.load({
                id: scriptParams.SearchInvoices
            });
            let invoices = getAllResults({
                search: searchInvoices
            });

            let invoiceIds = invoices.map(invoice => {
                return {
                    invoice: invoice.id,
                    sender: scriptParams.EmailSender,
                    template: scriptParams.EmailTemplate
                };
            });
            log.debug({
                title: `${title} invoiceIds`,
                details: JSON.stringify(invoiceIds)
            });

            return invoiceIds;
        };

        const reduce = (context) => {
            let valueObject = JSON.parse(context.values[0]);
            let title = `reduce ${valueObject.invoice}`
            log.debug({
                title: title,
                details: JSON.stringify(valueObject)
            });

            let emailStatus = Invoice.SendEmail({
                invoice: valueObject.invoice,
                sender: valueObject.sender,
                template: valueObject.template
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });

            emailStatus.invoice = valueObject.invoice;
            context.write({
                key: valueObject.invoice,
                value: emailStatus
            });
        };

        const summarize = (summary) => {
            let title = 'summarize';

            let hasErrors = false;
            summary.reduceSummary.errors.iterator().each((key, err) => {
                log.error({
                    title: `${title} ${key}`,
                    details: err.toString()
                });
                hasErrors = true;
                return true;
            });

            if (hasErrors === true) {
                return;
            }

            let okCount = 0;
            summary.output.iterator().each((key, value) => {
                let valueObject = JSON.parse(value);
                log.debug({
                    title: `${title} output key = ${key}`,
                    details: JSON.stringify(value)
                });
                if (valueObject.status > 0) {
                    okCount++;
                }

                return true;
            });

            log.audit({
                title: `** END **`,
                details: `Successfully sent emails for ${okCount} invoices.`
            });
        };

        const getScriptParameters = () => {
            let title = 'getScriptParameters';
            let script = runtime.getCurrentScript();
            
            let params = {
                EmailSender: script.getParameter({
                    name: 'custscript_mr_arauto_invemail_sender'
                }),
                EmailTemplate: script.getParameter({
                    name: 'custscript_mr_arauto_invemail_tmpl'
                }),
                SearchInvoices: script.getParameter({
                    name: 'custscript_mr_arauto_invemail_ss'
                })
            };
            log.audit({
                title: `Script Parameters`,
                details: JSON.stringify(params)
            });
            return params;
        };

        const getAllResults = (options) => {
            let title = 'getAllResults';
            let allResults = [];
            let results = [];
            let startIndex = 0;
            let endIndex = 1000;
            let step = 1000;

            do {
                results = options.search.run().getRange({
                    start: startIndex,
                    end: endIndex
                });
                allResults = allResults.concat(results);
                startIndex += step;
                endIndex += step;
            } while (results.length >= step);

            log.debug({
                title: title,
                details: `allResults = ${allResults.length}`
            });
            log.audit({
                title: 'Invoices to send',
                details: allResults.length
            });
            return allResults;
        };

        return {
            getInputData,
            reduce,
            summarize
        };
    }
);