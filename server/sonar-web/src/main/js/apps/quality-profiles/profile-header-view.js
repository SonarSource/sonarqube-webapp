/*
 * SonarQube
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
import $ from 'jquery';
import _ from 'underscore';
import Marionette from 'backbone.marionette';
import ProfileCopyView from './copy-profile-view';
import ProfileRenameView from './rename-profile-view';
import ProfileDeleteView from './delete-profile-view';
import Template from './templates/quality-profiles-profile-header.hbs';

export default Marionette.ItemView.extend({
  template: Template,

  modelEvents: {
    'change': 'render'
  },

  events: {
    'click #quality-profile-backup': 'onBackupClick',
    'click #quality-profile-copy': 'onCopyClick',
    'click #quality-profile-rename': 'onRenameClick',
    'click #quality-profile-set-as-default': 'onDefaultClick',
    'click #quality-profile-delete': 'onDeleteClick'
  },

  onBackupClick (e) {
    $(e.currentTarget).blur();
  },

  onCopyClick (e) {
    e.preventDefault();
    this.copy();
  },

  onRenameClick (e) {
    e.preventDefault();
    this.rename();
  },

  onDefaultClick (e) {
    e.preventDefault();
    this.setAsDefault();
  },

  onDeleteClick (e) {
    e.preventDefault();
    this.delete();
  },

  copy () {
    new ProfileCopyView({ model: this.model }).render();
  },

  rename () {
    new ProfileRenameView({ model: this.model }).render();
  },

  setAsDefault () {
    this.model.trigger('setAsDefault', this.model);
  },

  delete () {
    new ProfileDeleteView({ model: this.model }).render();
  },

  serializeData () {
    const key = this.model.get('key');
    return _.extend(Marionette.ItemView.prototype.serializeData.apply(this, arguments), {
      encodedKey: encodeURIComponent(key),
      canWrite: this.options.canWrite
    });
  }
});


