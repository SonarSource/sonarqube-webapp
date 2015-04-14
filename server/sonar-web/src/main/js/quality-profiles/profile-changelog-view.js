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
    'templates/quality-profiles'
], function () {

  return Marionette.ItemView.extend({
    template: Templates['quality-profile-changelog'],

    events: {
      'submit #quality-profile-changelog-form': 'onFormSubmit',
      'click .js-show-more-changelog': 'onShowMoreChangelogClick'
    },

    initialize: function () {
      this.searchParameters = {};
    },

    onFormSubmit: function (e) {
      e.preventDefault();
      this.searchParameters = this.getSearchParameters();
      this.model.fetchChangelog(this.searchParameters);
    },

    onShowMoreChangelogClick: function (e) {
      e.preventDefault();
      this.model.fetchMoreChangelog(this.searchParameters);
    },

    getSearchParameters: function () {
      var form = this.$('#quality-profile-changelog-form');
      return {
        since: form.find('[name="since"]').val(),
        to: form.find('[name="to"]').val()
      };
    }
  });

});
