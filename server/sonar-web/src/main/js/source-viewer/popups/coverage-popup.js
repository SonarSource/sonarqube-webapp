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
  'common/popup',
  'workspace/main',
  'templates/source-viewer'
], function (Popup, Workspace) {

  var $ = jQuery;

  return Popup.extend({
    template: Templates['source-viewer-coverage-popup'],

    events: {
      'click a[data-uuid]': 'goToFile'
    },

    onRender: function () {
      Popup.prototype.onRender.apply(this, arguments);
      this.$('.bubble-popup-container').isolatedScroll();
    },

    goToFile: function (e) {
      var uuid = $(e.currentTarget).data('uuid');
      if (Workspace == null) {
        Workspace = require('workspace/main');
      }
      Workspace.openComponent({ uuid: uuid });
    },

    serializeData: function () {
      var row = this.options.row || {},
          files = this.model.get('files'),
          tests = _.groupBy(this.model.get('tests'), '_ref'),
          testFiles = _.map(tests, function (testSet, fileRef) {
            return {
              file: files[fileRef],
              tests: testSet
            };
          });
      _.extend(row, {
        lineHits: row[this.options.tests + 'LineHits'],
        conditions: row[this.options.tests + 'Conditions'],
        coveredConditions: row[this.options.tests + 'CoveredConditions']
      });
      return {
        testFiles: testFiles,
        tests: this.options.tests,
        row: row
      };
    }
  });
});
