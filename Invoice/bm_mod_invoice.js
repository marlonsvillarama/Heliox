/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Definitions module for the Invoice record type.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/03/17           Initial version
 * 
 */

define(
    [],
    () => {
        return {
            Type: 'invoice',
            Fields: {
                customer: 'entity',
                salesRep: 'salesrep',
                transactionNumber: 'tranid',
                backendUrl: 'custpage_url_backend'
            }
        };
    }
);