/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Client Script for the Invoice record type.
 * 
 * @NApiVersion         2.1
 * @NScriptType         ClientScript
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
        'N/currentRecord',
        'N/ui/dialog',
        'N/ui/message',

        './bm_mod_invoice',
        './bm_lib_email'
    ],
    (
        currentRecord,
        dialog,
        message,

        Invoice,
        Email
    ) => {
        const pageInit = (context) => {};

        const emailInvoice = (options) => {
            let title = 'emailInvoice';
            let thisRecord = currentRecord.get();

            let backendUrl = thisRecord.getValue({
                fieldId: Invoice.Fields.backendUrl
            });
            console.log(`backend URL = ${backendUrl}`);
            if (!backendUrl) {
                console.log('Missing backend URL. Exiting...')
                return;
            }

            let emailMessage = message.create({
                type: message.Type.INFORMATION,
                title: 'Emailing invoice...',
                message: 'This may take a few moments. Please do not close this window.'
            });
            emailMessage.show();

            fetch(
                `${backendUrl}&invoice=${thisRecord.id}`
            )
            .then(data => data.json())
            .then(data => {
                dialog.alert({
                    title: `Send Invoice Email`,
                    message: data.message
                });
                // emailMessage.hide();
                location.reload();
            });
        }

        return {
            pageInit,

            emailInvoice
        };
    }
);