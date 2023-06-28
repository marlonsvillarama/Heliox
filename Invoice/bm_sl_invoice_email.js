/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Backend Suitelet script for emailing invoices to multiple recipients.
 * 
 * @NApiVersion         2.1
 * @NScriptType         Suitelet
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
        'N/log',
        'N/runtime',
        
        './bm_lib_invoice'
    ],
    (
        log,
        runtime,

        Lib
    ) => {
        const Parameters = {
            Sender: 'custscript_sl_invoice_email_sender',
            Template: 'custscript_sl_invoice_email_template'
        };

        const onRequest = ({ request, response }) => {
            let title = 'onRequest';
            let method = request.method.toLowerCase();

            switch (method) {
                case 'get': {
                    processGet({ request, response });
                    break;
                }
                default: {
                    log.error({
                        title: title,
                        details: `Invalid HTTP method ${method}. Exiting...`
                    });
                    break;
                }
            }
        };

        const processGet = ({ request, response }) => {
            let title = 'processGet';
            let params = request.parameters;
            let scriptParams = getScriptParameters();
            if (!scriptParams) {
                response.write({
                    output: JSON.stringify({
                        status: 0,
                        error: 'Incomplete backend script parameters'
                    })
                });
                return;
            }

            if (!params.invoice) {
                let error = 'Missing required parameter: Invoice ID.';
                log.error({
                    title: title,
                    details: error
                });
                response.write({
                    output: JSON.stringify({
                        status: 0,
                        error: error
                    })
                });
                return;
            }

            let emailStatus = Lib.SendEmail({
                invoice: params.invoice,
                sender: scriptParams.sender,
                template: scriptParams.template
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });

            response.write({
                output: JSON.stringify(emailStatus)
            });
        };

        const getScriptParameters = () => {
            let title = 'getScriptParameters';
            let script = runtime.getCurrentScript();

            let sender = script.getParameter({
                name: Parameters.Sender
            });
            if (!sender) {
                log.error({
                    title: title,
                    details: `Missing required parameter: Email Sender.`
                });
                return null;
            }

            let template = script.getParameter({
                name: Parameters.Template
            });
            if (!template) {
                log.error({
                    title: title,
                    details: `Missing required parameter: Email Template.`
                });
                return null;
            }

            let paramValues = {
                sender: sender,
                template: template
            };
            log.debug({
                title: title,
                details: JSON.stringify(paramValues)
            });
            return paramValues;
        };

        return {
            onRequest
        };
    }
);