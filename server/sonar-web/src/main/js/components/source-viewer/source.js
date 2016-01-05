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

export default Backbone.Model.extend({
  idAttribute: 'uuid',

  defaults: function () {
    return {
      exist: true,

      hasSource: false,
      hasCoverage: false,
      hasITCoverage: false,
      hasDuplications: false,
      hasSCM: false,

      canSeeCode: true
    };
  },

  key: function () {
    return this.get('key');
  },

  addMeta: function (meta) {
    var source = this.get('source'),
        metaIdx = 0,
        metaLine = meta[metaIdx];
    source.forEach(function (line) {
      while (metaLine != null && line.line > metaLine.line) {
        metaLine = meta[++metaIdx];
      }
      if (metaLine != null && line.line === metaLine.line) {
        _.extend(line, metaLine);
        metaLine = meta[++metaIdx];
      }
    });
    this.set({ source: source });
  },

  addDuplications: function (duplications) {
    var source = this.get('source');
    if (source != null) {
      source.forEach(function (line) {
        var lineDuplications = [];
        duplications.forEach(function (d, i) {
          var duplicated = false;
          d.blocks.forEach(function (b) {
            if (b._ref === '1') {
              var lineFrom = b.from,
                  lineTo = b.from + b.size - 1;
              if (line.line >= lineFrom && line.line <= lineTo) {
                duplicated = true;
              }
            }
          });
          lineDuplications.push(duplicated ? i + 1 : false);
        });
        line.duplications = lineDuplications;
      });
    }
    this.set({ source: source });
  },

  checkIfHasDuplications: function () {
    var hasDuplications = false,
        source = this.get('source');
    if (source != null) {
      source.forEach(function (line) {
        if (line.duplicated) {
          hasDuplications = true;
        }
      });
    }
    this.set({ hasDuplications: hasDuplications });
  },

  hasUTCoverage: function (source) {
    return _.some(source, function (line) {
      return line.utCoverageStatus != null;
    });
  },

  hasITCoverage: function (source) {
    return _.some(source, function (line) {
      return line.itCoverageStatus != null;
    });
  }
});


