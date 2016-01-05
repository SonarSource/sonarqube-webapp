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
import $ from 'jquery';
import _ from 'underscore';
import ChoiceFilters from './choice-filters';
import Template from '../templates/more-criteria-filter.hbs';
import DetailsTemplate from '../templates/more-criteria-details-filter.hbs';

var DetailsMoreCriteriaFilterView = ChoiceFilters.DetailsChoiceFilterView.extend({
  template: DetailsTemplate,


  events: {
    'click label[data-id]:not(.inactive)': 'enableFilter'
  },


  enableById: function (id) {
    this.model.view.options.filterBarView.enableFilter(id);
    this.model.view.hideDetails();
  },


  enableByProperty: function (property) {
    var filter = _.find(this.model.get('filters'), function (f) {
      return f.get('property') === property;
    });
    if (filter) {
      this.enableById(filter.cid);
    }
  },


  enableFilter: function (e) {
    var id = $(e.target).data('id');
    this.enableById(id);
    this.updateCurrent(0);
  },


  selectCurrent: function () {
    this.$('label').eq(this.currentChoice).click();
  },


  serializeData: function () {
    var filters = this.model.get('filters').map(function (filter) {
          return _.extend(filter.toJSON(), { id: filter.cid });
        }),
        getName = function (filter) {
          return filter.name;
        },
        uniqueFilters = _.unique(filters, getName),
        sortedFilters = _.sortBy(uniqueFilters, getName);
    return _.extend(this.model.toJSON(), { filters: sortedFilters });
  }

});


var MoreCriteriaFilterView = ChoiceFilters.ChoiceFilterView.extend({
  template: Template,
  className: 'navigator-filter navigator-filter-more-criteria',


  initialize: function () {
    ChoiceFilters.ChoiceFilterView.prototype.initialize.call(this, {
      detailsView: DetailsMoreCriteriaFilterView
    });
  },


  renderValue: function () {
    return '';
  },


  renderInput: function () {
  },


  renderBase: function () {
    ChoiceFilters.ChoiceFilterView.prototype.renderBase.call(this);
    this.$el.prop('title', '');
  },


  isDefaultValue: function () {
    return false;
  }

});


/*
 * Export public classes
 */

export default {
  DetailsMoreCriteriaFilterView: DetailsMoreCriteriaFilterView,
  MoreCriteriaFilterView: MoreCriteriaFilterView
};


