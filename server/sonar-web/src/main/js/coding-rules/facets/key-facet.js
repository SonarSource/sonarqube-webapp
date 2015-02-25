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
    'coding-rules/facets/base-facet',
    'templates/coding-rules'
], function (BaseFacet) {

  return BaseFacet.extend({
    template: Templates['coding-rules-key-facet'],

    onRender: function () {
      this.$el.toggleClass('hidden', !this.options.app.state.get('query').rule_key);
    },

    disable: function () {
      this.options.app.state.updateFilter({ rule_key: null });
    },

    serializeData: function () {
      return _.extend(BaseFacet.prototype.serializeData.apply(this, arguments), {
        key: this.options.app.state.get('query').rule_key
      });
    }
  });

});
