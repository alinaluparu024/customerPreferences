'use strict';

var base = module.superModule;

/**
 * Creates a plain object that contains profile information
 * @param {Object} profile - current customer's profile
 * @returns {Object} an object that contains information about the current customer's profile
 */
function getProfile(profile) {
  var result;
  if (profile) {
    result = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: Object.prototype.hasOwnProperty.call(profile, 'phone') ? profile.phone : profile.phoneHome,
      password: '********',
      birthday: profile.birthday,
      interests: profile.custom.interests || [],
      newsletter: profile.custom.newsletter
    };
  } else {
    result = null;
  }
  return result;
}

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel) {
    base.call(this, currentCustomer, addressModel, orderModel);
    this.profile = getProfile(currentCustomer.raw.profile);
}

module.exports = account;
