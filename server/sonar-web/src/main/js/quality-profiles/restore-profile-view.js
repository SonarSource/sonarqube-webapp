/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
define([
  'common/modal-form',
  'common/file-upload',
  'templates/quality-profiles'
], function (ModalFormView, uploader) {

  var $ = jQuery;

  return ModalFormView.extend({
    template: Templates['quality-profiles-restore-profile'],

    onFormSubmit: function (e) {
      var that = this;
      ModalFormView.prototype.onFormSubmit.apply(this, arguments);
      uploader({ form: $(e.currentTarget) }).done(function (r) {
        if (typeof r === 'object') {
          if (_.isArray(r.errors) || _.isArray(r.warning)) {
            that.showErrors(r.errors, r.warnings);
            return;
          }
        }
        that.collection.fetch();
        that.close();
      });
    }
  });

});
