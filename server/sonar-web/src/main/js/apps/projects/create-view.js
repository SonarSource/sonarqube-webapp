import ModalForm from '../../components/common/modal-form';
import {createProject} from '../../api/components';
import Template from './templates/projects-create-form.hbs';

export default ModalForm.extend({
  template: Template,

  onRender: function () {
    this._super();
    this.$('[data-toggle="tooltip"]').tooltip({ container: 'body', placement: 'bottom' });
  },

  onDestroy: function () {
    this._super();
    this.$('[data-toggle="tooltip"]').tooltip('destroy');
  },

  onFormSubmit: function (e) {
    this._super(e);
    this.sendRequest();
  },

  sendRequest: function () {
    let data = {
      name: this.$('#create-project-name').val(),
      branch: this.$('#create-project-branch').val(),
      key: this.$('#create-project-key').val()
    };
    this.disableForm();
    return createProject({
      data,
      statusCode: {
        // do not show global error
        400: null
      }
    }).done(() => {
      if (this.options.refresh) {
        this.options.refresh();
      }
      this.destroy();
    }).fail((jqXHR) => {
      this.enableForm();
      this.showErrors([{ msg: jqXHR.responseJSON.err_msg }]);
    });
  }
});
