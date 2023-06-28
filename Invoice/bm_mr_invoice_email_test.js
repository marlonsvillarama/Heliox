/**
 * @NApiVersion         2.1
 * @NScriptType         MapReduceScript
 * @NModuleScope        Public
 */

define(
    [
        'N/email',
        'N/https',
        'N/log',
        'N/record',
        './bm_lib_invoice'
    ],
    (
        email,
        https,
        log,
        record,
        Invoice
    ) => {
        const getInputData = () => {
            return [ '25369' ];
        };

        const reduce = (context) => {
            let contextValue = context.values[0];
            let title = `reduce ID = ${contextValue}`;
            log.debug({
                title: title,
                details: `start`
            });
            
            try {
                let emailStatus = Invoice.SendEmail({
                    invoice: contextValue,
                    sender: -5,
                    template: 10
                });
                log.debug({
                    title: `${title} emailStatus`,
                    details: JSON.stringify(emailStatus)
                });
                /* let emailReminder = record.create({
                    type: 'customrecord_bm_inv_reminder'
                });
                emailReminder.setValue({
                    fieldId: 'custrecord_bm_inv_reminder_invoice',
                    value: contextValue
                });
                let emailId = emailReminder.save();
                log.debug({
                    title: title,
                    details: `Successfully created email reminder ID ${emailId}.`
                }); */
                /* https.requestRestlet({
                    scriptId: 'customscript_bm_sl_email_reminder',
                    deploymentId: 'customdeploy_bm_sl_email_reminder',
                    method: 'POST',
                    body: JSON.stringify({
                        invoice: contextValue,
                        sender: 84643,
                        template: 10
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }); */
                log.debug({
                    title: title,
                    details: `Successfully sent email for ${contextValue}.`
                });
            }
            catch (ex) {
                log.error({
                    title: title,
                    details: ex.toString()
                });
            }
        };

        const summarize = (summary) => {
            let title = 'summarize';

            summary.reduceSummary.errors.iterator().each((key, err) => {
                log.error({
                    title: `${title} ${key}`,
                    details: JSON.stringify(err)
                });
            });
        };

        return {
            getInputData,
            reduce,
            summarize
        };
    }
);