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
requirejs.config({
  baseUrl: baseUrl + '/js'
});


requirejs([
  'coding-rules/models/state',
  'coding-rules/layout',
  'coding-rules/models/rules',
  'components/navigator/models/facets',

  'coding-rules/controller',
  'components/navigator/router',

  'coding-rules/workspace-list-view',
  'coding-rules//workspace-header-view',

  'coding-rules/facets-view',
  'coding-rules/filters-view'
],
    function (State,
              Layout,
              Rules,
              Facets,
              Controller,
              Router,
              WorkspaceListView,
              WorkspaceHeaderView,
              FacetsView,
              FiltersView) {

      var $ = jQuery,
          App = new Marionette.Application();

      App.addInitializer(function () {
        this.layout = new Layout();
        $('.coding-rules').empty().append(this.layout.render().el);
        $('#footer').addClass('search-navigator-footer');
      });

      App.addInitializer(function () {
        this.state = new State();
        this.list = new Rules();
        this.facets = new Facets();
      });

      App.addInitializer(function () {
        this.controller = new Controller({
          app: this
        });
      });

      App.addInitializer(function () {
        this.workspaceListView = new WorkspaceListView({
          app: this,
          collection: this.list
        });
        this.layout.workspaceListRegion.show(this.workspaceListView);
        this.workspaceListView.bindScrollEvents();

        this.workspaceHeaderView = new WorkspaceHeaderView({
          app: this,
          collection: this.list
        });
        this.layout.workspaceHeaderRegion.show(this.workspaceHeaderView);

        this.facetsView = new FacetsView({
          app: this,
          collection: this.facets
        });
        this.layout.facetsRegion.show(this.facetsView);

        this.filtersView = new FiltersView({
          app: this
        });
        this.layout.filtersRegion.show(this.filtersView);
      });

      App.addInitializer(function () {
        key.setScope('list');
        this.router = new Router({
          app: this
        });
        Backbone.history.start();
      });

      App.manualRepository = function () {
        return {
          key: 'manual',
          name: t('coding_rules.manual_rule'),
          language: 'none'
        };
      };

      App.getSubCharacteristicName = function (key) {
        if (key != null) {
          var ch = _.findWhere(App.characteristics, { key: key }),
              parent = _.findWhere(App.characteristics, { key: ch.parent });
          return [parent.name, ch.name].join(' > ');
        } else {
          return null;
        }
      };

      var appXHR = $.get(baseUrl + '/api/rules/app').done(function(r) {
        App.canWrite = r.canWrite;
        App.qualityProfiles = _.sortBy(r.qualityprofiles, ['name', 'lang']);
        App.languages = _.extend(r.languages, {
          none: 'None'
        });
        _.map(App.qualityProfiles, function(profile) {
          profile.language = App.languages[profile.lang];
        });
        App.repositories = r.repositories;
        App.repositories.push(App.manualRepository());
        App.statuses = r.statuses;
        App.characteristics = r.characteristics.map(function (item, index) {
          return _.extend(item, { index: index });
        });
      });

      $.when(window.requestMessages(), appXHR).done(function () {
        App.start();
      });

    });
