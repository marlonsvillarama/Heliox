/**
 * @NApiVersion         2.1
 * @NScriptType         UserEventScript
 */

define(
    [
        'N/log',
        './bm_lib_invoice'
    ],
    (
        log,
        Invoice
    ) => {
        const afterSubmit = (context) => {
            let title = 'afterSubmit';
            let thisRecord = context.newRecord;
            let invoice = thisRecord.getValue({
                fieldId: 'custrecord_bm_inv_reminder_invoice'
            });

            let emailStatus = Invoice.SendEmail({
                invoice: invoice,
                sender: -5,
                template: 10
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });
        };

        return {
            afterSubmit
        };
    }
);