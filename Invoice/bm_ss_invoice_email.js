/**
 * @NApiVersion         2.1
 * @NScriptType         ScheduledScript
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
        const execute = (context) => {
            let title = 'execute';
            let emailStatus = Invoice.SendEmail({
                invoice: 25369,
                sender: 84643,
                template: 10
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });
        };

        return {
            execute
        };
    }
);