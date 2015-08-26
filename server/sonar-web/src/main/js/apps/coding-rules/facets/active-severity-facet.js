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
  './base-facet',
  '../templates'
], function (BaseFacet) {

  return BaseFacet.extend({
    template: Templates['coding-rules-severity-facet'],
    severities: ['BLOCKER', 'MINOR', 'CRITICAL', 'INFO', 'MAJOR'],

    initialize: function (options) {
      this.listenTo(options.app.state, 'change:query', this.onQueryChange);
    },

    onQueryChange: function () {
      var query = this.options.app.state.get('query'),
          isProfileSelected = query.qprofile != null,
          isActiveShown = '' + query.activation === 'true';
      if (!isProfileSelected || !isActiveShown) {
        this.forbid();
      }
    },

    onRender: function () {
      BaseFacet.prototype.onRender.apply(this, arguments);
      this.onQueryChange();
    },

    forbid: function () {
      BaseFacet.prototype.forbid.apply(this, arguments);
      this.$el.prop('title', window.t('coding_rules.filters.active_severity.inactive'));
    },

    allow: function () {
      BaseFacet.prototype.allow.apply(this, arguments);
      this.$el.prop('title', null);
    },

    sortValues: function (values) {
      var order = this.severities;
      return _.sortBy(values, function (v) {
        return order.indexOf(v.val);
      });
    }
  });

});
