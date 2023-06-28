/**
 * @NApiVersion         2.1
 * @NScriptType         Restlet
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
        const onRequest = ({ request, response }) => {
            let method = request.method.toLowerCase();

            if (method == 'post') {
                processPost({ request, response });
            }
        };

        // const processPost = ({ request, response }) => {
        const post = (data) => {
            let title = 'post';
            log.debug({
                title: title,
                details: data
            });

            let emailStatus = Invoice.SendEmail({
                invoice: data.invoice,
                sender: data.sender,
                template: data.template
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });
        };

        return {
            post
        };
    }
);