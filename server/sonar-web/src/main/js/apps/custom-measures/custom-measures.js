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
import _ from 'underscore';
import Backbone from 'backbone';
import CustomMeasure from './custom-measure';

export default Backbone.Collection.extend({
  model: CustomMeasure,

  initialize: function (options) {
    this.projectId = options.projectId;
  },

  url: function () {
    return baseUrl + '/api/custom_measures/search';
  },

  parse: function (r) {
    this.total = r.total;
    this.p = r.p;
    this.ps = r.ps;
    return r.customMeasures;
  },

  fetch: function (options) {
    var opts = _.defaults(options || {}, { data: {} });
    this.q = opts.data.q;
    opts.data.projectId = this.projectId;
    return Backbone.Collection.prototype.fetch.call(this, opts);
  },

  fetchMore: function () {
    var p = this.p + 1;
    return this.fetch({ add: true, remove: false, data: { p: p, ps: this.ps, q: this.q } });
  },

  refresh: function () {
    return this.fetch({ reset: true, data: { q: this.q } });
  },

  hasMore: function () {
    return this.total > this.p * this.ps;
  },

  getTakenMetrics: function () {
    var metrics = this.map(function (model) {
      return model.get('metric').id;
    });
    return _.uniq(metrics);
  }

});


