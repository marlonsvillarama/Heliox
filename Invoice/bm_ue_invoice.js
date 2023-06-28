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
        './bm_lib_invoice'
    ],
    (
        log,
        LIB
    ) => {
        const beforeLoad = (context) => {
            let title = 'beforeLoad';
            let contextObject = {
                context: context
            };

            LIB.AddBackendUrlField(contextObject);

            LIB.AddSendEmailButton(contextObject);
        };

        return {
            beforeLoad
        };
    }
);