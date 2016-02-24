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
import _ from 'underscore';
import Marionette from 'backbone.marionette';
import Conditions from './conditions';
import DetailConditionsView from './gate-conditions-view';
import ProjectsView from './gate-projects-view';
import Template from './templates/quality-gate-detail.hbs';

export default Marionette.LayoutView.extend({
  template: Template,

  regions: {
    conditionsRegion: '#quality-gate-conditions',
    projectsRegion: '#quality-gate-projects'
  },

  modelEvents: {
    'change': 'render'
  },

  onRender () {
    this.showConditions();
    this.showProjects();
  },

  orderByName (conditions) {
    const metrics = this.options.metrics;
    return _.sortBy(conditions, (condition) => {
      return _.findWhere(metrics, { key: condition.metric }).name;
    });
  },

  showConditions () {
    const conditions = new Conditions(this.orderByName(this.model.get('conditions')));
    const view = new DetailConditionsView({
      canEdit: this.options.canEdit,
      collection: conditions,
      model: this.model,
      metrics: this.options.metrics,
      periods: this.options.periods
    });
    this.conditionsRegion.show(view);
  },

  showProjects () {
    const view = new ProjectsView({
      canEdit: this.options.canEdit,
      model: this.model
    });
    this.projectsRegion.show(view);
  }
});


