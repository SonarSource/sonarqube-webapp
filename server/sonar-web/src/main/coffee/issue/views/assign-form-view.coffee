#
# SonarQube, open source software quality management tool.
# Copyright (C) 2008-2014 SonarSource
# mailto:contact AT sonarsource DOT com
#
# SonarQube is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 3 of the License, or (at your option) any later version.
#
# SonarQube is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program; if not, write to the Free Software Foundation,
# Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#

define [
  'issue/views/action-options-view'
  'templates/issue'
], (
  ActionOptionsView
) ->

  $ = jQuery


  class extends ActionOptionsView
    template: Templates['issue-assign-form']
    optionTemplate: Templates['issue-assign-form-option']


    events: ->
      _.extend super,
        'click input': 'onInputClick'
        'keydown input': 'onInputKeydown'
        'keyup input': 'onInputKeyup'


    initialize: ->
      super
      @assignees = []
      @debouncedSearch = _.debounce @search, 250


    getAssignee: ->
      @model.get 'assignee'


    getAssigneeName: ->
      @model.get 'assigneeName'


    onRender: ->
      super
      @renderTags()
      setTimeout (=> @$('input').focus()), 100


    renderTags: ->
      @$('.issue-action-option').remove()
      @getAssignees().forEach @renderAssignee, @
      @selectInitialOption()


    renderAssignee: (assignee) ->
      html = @optionTemplate assignee
      @$('.issue-action-options').append html


    selectOption: (e) ->
      assignee = $(e.currentTarget).data 'value'
      assigneeName = $(e.currentTarget).data 'text'
      @submit assignee, assigneeName
      super


    submit: (assignee, assigneeName) ->
      _assignee = @getAssignee()
      _assigneeName = @getAssigneeName()
      return if assignee == _assignee
      if assignee == ''
        @model.set assignee: null, assigneeName: null
      else
        @model.set assignee: assignee, assigneeName: assigneeName
      $.ajax
        type: 'POST'
        url: "#{baseUrl}/api/issues/assign"
        data:
          issue: @model.id
          assignee: assignee
      .fail =>
        @model.set assignee: _assignee, assigneeName: _assigneeName


    onInputClick: (e) ->
      e.stopPropagation()


    onInputKeydown: (e) ->
      @query = @$('input').val()
      return @selectPreviousOption() if e.keyCode == 38 # up
      return @selectNextOption() if e.keyCode == 40 # down
      return @selectActiveOption() if e.keyCode == 13 # return
      return false if e.keyCode == 9 # tab
      @close() if e.keyCode == 27 # escape


    onInputKeyup: ->
      query = @$('input').val()
      if query != @query
        query = '' if query.length < 2
        @query = query
        @debouncedSearch query


    search: (query) ->
      if query.length > 1
        $.get "#{baseUrl}/api/users/search", s: query
        .done (data) =>
          @resetAssignees data.users
      else
        @resetAssignees []


    resetAssignees: (users) ->
      @assignees = users.map (user) ->
        id: user.login
        text: user.name
      @renderTags()


    getAssignees: ->
      return @assignees if @assignees.length > 0
      assignees = [{ id: '', text: t('unassigned') }]
      currentUser = window.SS.user
      currentUserName = window.SS.userName
      assignees.push id: currentUser, text: currentUserName
      if @getAssignee()
        assignees.push id: @getAssignee(), text: @getAssigneeName()
      @makeUnique assignees


    makeUnique: (assignees) ->
      _.uniq assignees, false, (assignee) -> assignee.id
