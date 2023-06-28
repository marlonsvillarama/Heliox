/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Client Script for the Customer record type.
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
        './bm_mod_customer',
        './bm_lib_email'
    ],
    (
        Customer,
        Email
    ) => {
        const validateField = (context) => {
            let thisRecord = context.currentRecord;

            if (context.fieldId === Customer.Fields.emailRecipients) {
                let emailAddresses = thisRecord.getValue({
                    fieldId: Customer.Fields.emailRecipients
                });

                let checkEmails = checkEmailAddresses(emailAddresses);
                return checkEmails;
            }

            return true;
        };

        const saveRecord = (context) => {
            let thisRecord = context.currentRecord;

            let emailAddresses = thisRecord.getValue({
                fieldId: Customer.Fields.emailRecipients
            });
            console.log(`emailAddresses = ${emailAddresses}`);
            if (emailAddresses) {
                return checkEmailAddresses(emailAddresses);
            }

            thisRecord.setValue({
                fieldId: Customer.Fields.emailRecipients,
                value: emailAddresses.trim(),
                ignoreFieldChange: true
            });

            return true;
        };

        const checkEmailAddresses = (emailAddresses) => {
            let isValid = validateEmailAddresses(emailAddresses);
            console.log(isValid);

            if (isValid.match === false) {
                alert(`The value "${isValid.email}" is not a valid email address.`);
            }

            return isValid.match;
        };

        const validateEmailAddresses = (emailAddresses) => {
            console.log(`emailAddresses = ${emailAddresses}`);
            for (let i=0, ilen=emailAddresses.length; i<ilen; i++) {
                console.log(emailAddresses[i]);
            }
            let delimiter = ' ';
            if (emailAddresses.indexOf(String.fromCharCode(10)) >= 0) {
                delimiter = delimiter.trim() + String.fromCharCode(10);
            }

            if (emailAddresses.indexOf(String.fromCharCode(13)) >= 0) {
                delimiter = delimiter.trim() + String.fromCharCode(13);
            }

            console.log(`delimiter = "${delimiter}"`);

            let isValidRecipients = true;
            // if (delimiter != ' ') {
                isValidRecipients = Email.ValidateRecipients({
                    recipients: emailAddresses,
                    delimiter: delimiter
                });
            // }
            console.log(isValidRecipients);

            return isValidRecipients;
        };

        return {
            validateField,
            saveRecord
        };
    }
);