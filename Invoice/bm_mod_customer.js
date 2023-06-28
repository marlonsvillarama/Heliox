/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Definitions module for the Customer record type.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/04/06           Initial version
 * 
 */

define(
    [],
    () => {
        return {
            Type: 'customer',
            Fields: {
                companyName: 'companyname',
                email: 'email',
                emailRecipients: 'custentity_heliox_otherbillingemail'
            }
        };
    }
);