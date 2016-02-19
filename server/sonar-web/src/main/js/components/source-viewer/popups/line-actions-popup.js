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
import Popup from '../../common/popup';
import ManualIssueView from '../../issue/manual-issue-view';
import Template from '../templates/source-viewer-line-options-popup.hbs';

export default Popup.extend({
  template: Template,

  events: {
    'click .js-get-permalink': 'getPermalink',
    'click .js-add-manual-issue': 'addManualIssue'
  },

  getPermalink: function (e) {
    e.preventDefault();
    var url = '/component/index?id=' +
            (encodeURIComponent(this.model.key())) + '&line=' + this.options.line,
        windowParams = 'resizable=1,scrollbars=1,status=1';
    window.open(url, this.model.get('name'), windowParams);
  },

  addManualIssue: function (e) {
    e.preventDefault();
    var that = this,
        line = this.options.line,
        component = this.model.key(),
        manualIssueView = new ManualIssueView({
          line: line,
          component: component
        });
    manualIssueView.render().$el.appendTo(this.options.row.find('.source-line-code'));
    manualIssueView.on('add', function (issue) {
      that.trigger('onManualIssueAdded', issue);
    });
  }
});


