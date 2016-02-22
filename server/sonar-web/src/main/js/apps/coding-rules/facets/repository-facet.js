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
import CustomValuesFacet from './custom-values-facet';

export default CustomValuesFacet.extend({

  getUrl () {
    return '/api/rules/repositories';
  },

  prepareAjaxSearch () {
    return {
      quietMillis: 300,
      url: this.getUrl(),
      data (term) {
        return { q: term, ps: 10000 };
      },
      results (data) {
        return {
          more: false,
          results: data.repositories.map(function (repo) {
            return { id: repo.key, text: repo.name + ' (' + repo.language + ')' };
          })
        };
      }
    };
  },

  getLabelsSource () {
    const repos = this.options.app.repositories;
    return _.object(_.pluck(repos, 'key'), _.pluck(repos, 'name'));
  },

  getValues () {
    const that = this;
    const labels = that.getLabelsSource();
    return this.model.getValues().map(function (value) {
      const repo = _.findWhere(that.options.app.repositories, { key: value.val });
      if (repo != null) {
        const langName = that.options.app.languages[repo.language];
        _.extend(value, { extra: langName });
      }
      return _.extend(value, { label: labels[value.val] });
    });
  },

  serializeData () {
    return _.extend(CustomValuesFacet.prototype.serializeData.apply(this, arguments), {
      values: this.getValues()
    });
  }

});
