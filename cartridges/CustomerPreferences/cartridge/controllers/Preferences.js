'use strict';

/**
 * @namespace Preferences
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Preferences-EditPreferences : The Account-EditProfile endpoint renders the page that allows a shopper to edit their profile. The edit profile form is prefilled with the shopper's first name, last name, phone number and email
 * @name Base/Preferences-EditPreferences
 * @function
 * @memberof Preferences
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'Edit',
    server.middleware.https,
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var accountHelpers = require('*/cartridge/scripts/account/accountHelpers');

        var accountModel = accountHelpers.getAccountModel(req);
        var profileForm = server.forms.getForm('preferences');
        profileForm.clear();
        profileForm.customerPreferences.birthday.value = accountModel.profile.birthday;
        // profileForm.customerPreferences.interests.value = accountModel.profile.interests[0] || '';
        // eslint-disable-next-line max-len
        profileForm.customerPreferences.newsletterSubscription.value = accountModel.profile.newsletter;
        res.render('account/preferences', {
            profileForm: profileForm,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('Account-Show').toString()
                }
            ]
        });
        next();
    }
);

module.exports = server.exports();
