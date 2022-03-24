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
        var interests=[];
        accountModel.profile.interests.forEach(element => {
            if ( element == 'electronic' ){
                profileForm.customerPreferences.interestsElectronic.checked = true;
                interests.push(element);
            }
            if ( element == 'apparel'){
                profileForm.customerPreferences.interestsApparel.checked = true;
                interests.push(element);
            }
            })
    
        // profileForm.customerPreferences.interests.value = accountModel.profile.interests[0] || '';
        // eslint-disable-next-line max-len
         if (accountModel.profile.newsletter == false){
            profileForm.customerPreferences.newsletterSubscription.checked = false;
         } else{
            profileForm.customerPreferences.newsletterSubscription.checked = true;
         }
       // profileForm.customerPreferences.newsletterSubscription.value = accountModel.profile.newsletter;
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

/**
 * Preferences-SavePreferences : The Preferences-SavePreferences endpoint is the endpoint that gets hit when a shopper has edited their preferences
 * @name Base/Preferences-SavePreferences
 * @function
 * @memberof Preferences
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password  - Input field for the shopper's password
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensititve
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'Save',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var Transaction = require('dw/system/Transaction');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');

        var formErrors = require('*/cartridge/scripts/formErrors');
        var preferencesForm = server.forms.getForm('preferences');
        var birthday = null;
        if (preferencesForm.customerPreferences.birthday.htmlValue) {
            birthday = new Date(preferencesForm.customerPreferences.birthday.htmlValue);
        }

        var interests = [];
        if (preferencesForm.customerPreferences.interestsElectronic.checked) {
            interests.push(Resource.msg('label.profile.interests.electronic.id', 'account', ''));
        }
        if (preferencesForm.customerPreferences.interestsApparel.checked) {
            interests.push(Resource.msg('label.profile.interests.apparel.id', 'account', ''));
        }
  
        // form validation
        var result = {
            birthday: birthday,
            interests: interests,
            newsletter: preferencesForm.customerPreferences.newsletterSubscription.checked,
            preferencesForm: preferencesForm
        };

        if (preferencesForm.valid) {
            res.setViewData(result);
            this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
                var formInfo = res.getViewData();
                var customer = CustomerMgr.getCustomerByCustomerNumber(
                    req.currentCustomer.profile.customerNo
                );
                var profile = customer.getProfile();
  
                Transaction.wrap(function () {
                    profile.setBirthday(formInfo.birthday);
                    profile.custom.newsletter = formInfo.newsletter;
                    profile.custom.interests = formInfo.interests;
                });
  
                res.json({
                    success: true,
                    redirectUrl: URLUtils.url('Account-Show').toString()
                });
            });
        } else {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(preferencesForm)
            });
        }
        return next();
    }
  );

module.exports = server.exports();
