'use strict';

var base = require('base/profile/profile');
var formValidation = require('base/components/formValidation');

function submitPreferences() {
  $('form.edit-preferences-form').submit(function (e) {
    var $form = $(this);
    e.preventDefault();
    var url = $form.attr('action');
    $form.spinner().start();
    // $('form.edit-preferences-form').trigger('profile:edit', e);
    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: $form.serialize(),
        success: function (data) {
            $form.spinner().stop();
            if (!data.success) {
                formValidation($form, data);
            } else {
                location.href = data.redirectUrl;
            }
        },
        error: function (err) {
            if (err.responseJSON.redirectUrl) {
                window.location.href = err.responseJSON.redirectUrl;
            }
            $form.spinner().stop();
        }
    });
    return false;
});
}

base.submitPreferences = submitPreferences;
module.exports = base;
