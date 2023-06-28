/**
 * Copyright 2023 BitMovin, Inc. All rights reserved
 * 
 * Summary:
 * Library module for the Invoice record type.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/04/04           Initial version
 * 
 */

define(
    [
        'N/log'
    ],
    (
        log
    ) => {
        const validateRecipients = (options) => {
            let title = 'validateRecipients';

            let recipients = options.recipients;
            if (!recipients) {
                log.audit({
                    title: title,
                    details: `No email recipients found. Exiting...`
                });
                return {
                    email: recipients,
                    match: false
                };
            }

            let recipientsTrim = recipients.trim();
            if (recipientsTrim == '') {
                log.audit({
                    title: title,
                    details: `No email recipients found. Exiting...`
                });
                return {
                    email: recipientsTrim,
                    match: false
                };
            }

            let recipientsList = recipientsTrim.split(options.delimiter);
            if (recipientsList.length <= 0) {
                log.audit({
                    title: title,
                    details: 'No valid email recipients found. Exiting...'
                });
                return {
                    email: recipientsTrim,
                    match: false
                };
            }

            let isValidEmail = {};
            for (let i=0, ilen=recipientsList.length; i<ilen; i++) {
                isValidEmail = validateEmail(recipientsList[i]);
                
                isValidEmail = {
                    email: recipientsList[i],
                    match: isValidEmail.match
                };

                if (isValidEmail.match === false) {
                    log.error({
                        title: title,
                        details: `String "${recipientsList[i]}" is not a valid email address.`
                    });
                    break;
                }
            }

            log.debug({
                title: `${title} email = ${recipientsTrim}`,
                details: JSON.stringify(isValidEmail)
            });
            return isValidEmail;
        };

        const validateEmail = (email) => {
            let REGEX_EMAIL = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            if (email.toLowerCase().match(REGEX_EMAIL)) {
                return {
                    email: email,
                    match: true
                };
            }

            return {
                email: email,
                match: false
            };
    };

        return {
            ValidateEmail: validateEmail,
            ValidateRecipients: validateRecipients
        };
    }
);