/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * User Event script for the Invoice record type.
 * 
 * @NApiVersion         2.1
 * @NScriptType         UserEventScript
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

        Invoice
    ) => {
        const afterSubmit = (context) => {
            let title = 'afterSubmit';

            if (context.type != 'create' && context.type != 'edit') {
                log.error({
                    title: title,
                    details: `Invalid event type ${context.type}. Exiting...`
                });
                return;
            }

            
            let thisRecord = context.newRecord;
            let emailStatus = Invoice.SendEmail({
                invoice: thisRecord.id,
                sender: ,
                template: 
            });
            log.debug({
                title: `${title} emailStatus`,
                details: JSON.stringify(emailStatus)
            });
        };

        return {
            beforeLoad
        };
    }
);