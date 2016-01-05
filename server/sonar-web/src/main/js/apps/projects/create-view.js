/*
 * SonarQube :: Web
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import ModalForm from '../../components/common/modal-form';
import { createProject } from '../../api/components';
import Template from './templates/projects-create-form.hbs';


export default ModalForm.extend({
  template: Template,

  onRender: function () {
    ModalForm.prototype.onRender.apply(this, arguments);
    this.$('[data-toggle="tooltip"]').tooltip({ container: 'body', placement: 'bottom' });
  },

  onDestroy: function () {
    ModalForm.prototype.onDestroy.apply(this, arguments);
    this.$('[data-toggle="tooltip"]').tooltip('destroy');
  },

  onFormSubmit: function () {
    ModalForm.prototype.onFormSubmit.apply(this, arguments);
    this.sendRequest();
  },

  sendRequest: function () {
    let data = {
      name: this.$('#create-project-name').val(),
      branch: this.$('#create-project-branch').val(),
      key: this.$('#create-project-key').val()
    };
    this.disableForm();
    return createProject(data)
        .then(() => {
          if (this.options.refresh) {
            this.options.refresh();
          }
          this.destroy();
        })
        .catch(error => {
          this.enableForm();
          if (error.response.status === 400) {
            error.response.json().then(obj => this.showErrors([{ msg: obj.err_msg }]));
          }
        });
  }
});
