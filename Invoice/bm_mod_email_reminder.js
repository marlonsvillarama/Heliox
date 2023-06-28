/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Definitions module for the BM|Invoice Email Reminder record type.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/04/19           Initial version
 * 
 */

define(
    [],
    () => {
        return {
            type: 'customrecord_inv_reminder',
            Fields: {
                invoice: 'custrecord_inv_reminder_invoice',
                author: 'custrecord_inv_reminder_author',
                subject: 'custrecord_inv_reminder_subject',
                body: 'custrecord_inv_reminder_body',
                recipients: 'custrecord_inv_reminder_recs',
                cc: 'custrecord_inv_reminder_cc'
            }
        };
    }
);