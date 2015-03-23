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
    template: Templates['source-viewer-duplication-popup'],

    events: {
      'click a[data-uuid]': 'goToFile'
    },

    goToFile: function (e) {
      var uuid = $(e.currentTarget).data('uuid'),
          line = $(e.currentTarget).data('line');
      if (Workspace == null) {
        Workspace = require('workspace/main');
      }
      Workspace.openComponent({ uuid: uuid, line: line });
    },

    serializeData: function () {
      var duplications, files, groupedBlocks;
      files = this.model.get('duplicationFiles');
      groupedBlocks = _.groupBy(this.collection.toJSON(), '_ref');
      duplications = _.map(groupedBlocks, function (blocks, fileRef) {
        return {
          blocks: blocks,
          file: files[fileRef]
        };
      });
      duplications = _.sortBy(duplications, (function (_this) {
        return function (d) {
          var a, b, c;
          a = d.file.projectName !== _this.model.get('projectName');
          b = d.file.subProjectName !== _this.model.get('subProjectName');
          c = d.file.key !== _this.model.get('key');
          return '' + a + b + c;
        };
      })(this));
      return {
        component: this.model.toJSON(),
        duplications: duplications
      };
    }
  });
});
