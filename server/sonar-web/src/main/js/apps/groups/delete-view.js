define([
  'components/common/modal-form',
  './templates'
], function (ModalForm) {

  return ModalForm.extend({
    template: Templates['groups-delete'],

    onFormSubmit: function () {
      ModalForm.prototype.onFormSubmit.apply(this, arguments);
      this.sendRequest();
    },

    sendRequest: function () {
      var that = this,
          collection = this.model.collection;
      return this.model.destroy({
        wait: true,
        statusCode: {
          // do not show global error
          400: null
        }
      }).done(function () {
        collection.total--;
        that.destroy();
      }).fail(function (jqXHR) {
        that.showErrors(jqXHR.responseJSON.errors, jqXHR.responseJSON.warnings);
      });
    },

    showErrors: function () {
      this.$('.js-modal-text').addClass('hidden');
      this.disableForm();
      ModalForm.prototype.showErrors.apply(this, arguments);
    }
  });

});
