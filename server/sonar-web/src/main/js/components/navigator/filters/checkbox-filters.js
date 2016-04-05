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
import BaseFilters from './base-filters';
import Template from '../templates/checkbox-filter.hbs';

export default BaseFilters.BaseFilterView.extend({
  template: Template,
  className: 'navigator-filter navigator-filter-inline',

  events () {
    return {
      'click .navigator-filter-disable': 'disable'
    };
  },

  showDetails () {
  },

  renderInput () {
    if (this.model.get('enabled')) {
      $('<input>')
          .prop('name', this.model.get('property'))
          .prop('type', 'checkbox')
          .prop('value', 'true')
          .prop('checked', true)
          .css('display', 'none')
          .appendTo(this.$el);
    }
  },

  renderValue () {
    return this.model.get('value');
  },

  isDefaultValue () {
    return false;
  },

  restore (value) {
    this.model.set({
      value,
      enabled: true
    });
  }

});

