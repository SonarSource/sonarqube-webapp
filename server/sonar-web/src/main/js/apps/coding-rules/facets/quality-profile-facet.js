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
import BaseFacet from './base-facet';
import Template from '../templates/facets/coding-rules-quality-profile-facet.hbs';

export default BaseFacet.extend({
  template: Template,

  events () {
    return _.extend(BaseFacet.prototype.events.apply(this, arguments), {
      'click .js-active': 'setActivation',
      'click .js-inactive': 'unsetActivation'
    });
  },

  getValues () {
    const that = this;
    const languagesQuery = this.options.app.state.get('query').languages;
    const languages = languagesQuery != null ? languagesQuery.split(',') : [];
    const lang = languages.length === 1 ? languages[0] : null;
    const values = this.options.app.qualityProfiles
        .filter(function (profile) {
          return lang != null ? profile.lang === lang : true;
        })
        .map(function (profile) {
          return {
            label: profile.name,
            extra: that.options.app.languages[profile.lang],
            val: profile.key
          };
        });
    return _.sortBy(values, 'label');
  },

  toggleFacet (e) {
    const obj = {};
    const property = this.model.get('property');
    if ($(e.currentTarget).is('.active')) {
      obj.activation = null;
      obj[property] = null;
    } else {
      obj.activation = true;
      obj[property] = $(e.currentTarget).data('value');
    }
    this.options.app.state.updateFilter(obj);
  },

  setActivation (e) {
    e.stopPropagation();
    this.options.app.state.updateFilter({ activation: 'true' });
  },

  unsetActivation (e) {
    e.stopPropagation();
    this.options.app.state.updateFilter({ activation: 'false', active_severities: null });
  },

  getToggled () {
    const activation = this.options.app.state.get('query').activation;
    return activation === 'true' || activation === true;
  },

  disable () {
    const obj = { activation: null };
    const property = this.model.get('property');
    obj[property] = null;
    this.options.app.state.updateFilter(obj);
  },

  serializeData () {
    return _.extend(BaseFacet.prototype.serializeData.apply(this, arguments), {
      values: this.getValues(),
      toggled: this.getToggled()
    });
  }
});
