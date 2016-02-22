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
import Backbone from 'backbone';
import Issue from '../models/issue';

export default Backbone.Collection.extend({
  model: Issue,

  url () {
    return '/api/issues/search';
  },

  _injectRelational (issue, source, baseField, lookupField) {
    const baseValue = issue[baseField];
    if (baseValue != null && _.size(source)) {
      const lookupValue = _.find(source, function (candidate) {
        return candidate[lookupField] === baseValue;
      });
      if (lookupValue != null) {
        Object.keys(lookupValue).forEach(function (key) {
          const newKey = baseField + key.charAt(0).toUpperCase() + key.slice(1);
          issue[newKey] = lookupValue[key];
        });
      }
    }
    return issue;
  },

  _injectCommentsRelational (issue, users) {
    if (issue.comments) {
      const that = this;
      const newComments = issue.comments.map(function (comment) {
        let newComment = _.extend({}, comment, { author: comment.login });
        delete newComment.login;
        newComment = that._injectRelational(newComment, users, 'author', 'login');
        return newComment;
      });
      issue = _.extend({}, issue, { comments: newComments });
    }
    return issue;
  },

  _prepareClosed (issue) {
    if (issue.status === 'CLOSED') {
      issue.flows = [];
      delete issue.textRange;
    }
    return issue;
  },

  ensureTextRange (issue) {
    if (issue.line && !issue.textRange) {
      // FIXME 999999
      issue.textRange = {
        startLine: issue.line,
        endLine: issue.line,
        startOffset: 0,
        endOffset: 999999
      };
    }
    return issue;
  },

  parse (r) {
    const that = this;

    this.paging = {
      p: r.p,
      ps: r.ps,
      total: r.total,
      maxResultsReached: r.p * r.ps >= r.total
    };

    return r.issues.map(function (issue) {
      issue = that._injectRelational(issue, r.components, 'component', 'key');
      issue = that._injectRelational(issue, r.components, 'project', 'key');
      issue = that._injectRelational(issue, r.components, 'subProject', 'key');
      issue = that._injectRelational(issue, r.rules, 'rule', 'key');
      issue = that._injectRelational(issue, r.users, 'assignee', 'login');
      issue = that._injectRelational(issue, r.users, 'reporter', 'login');
      issue = that._injectRelational(issue, r.actionPlans, 'actionPlan', 'key');
      issue = that._injectCommentsRelational(issue, r.users);
      issue = that._prepareClosed(issue);
      issue = that.ensureTextRange(issue);
      return issue;
    });
  }
});


