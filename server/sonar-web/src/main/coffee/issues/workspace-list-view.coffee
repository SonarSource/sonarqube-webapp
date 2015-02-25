define [
  'components/navigator/workspace-list-view'
  'issues/workspace-list-item-view'
  'issues/workspace-list-empty-view'
  'templates/issues'
], (
  WorkspaceListView
  IssueView
  EmptyView
) ->

  $ = jQuery

  COMPONENT_HEIGHT = 29
  BOTTOM_OFFSET = 10


  class extends WorkspaceListView
    template: Templates['issues-workspace-list']
    componentTemplate: Templates['issues-workspace-list-component']
    itemView: IssueView
    itemViewContainer: '.js-list'
    emptyView: EmptyView


    bindShortcuts: ->
      doAction = (action) =>
        selectedIssue = @collection.at @options.app.state.get 'selectedIndex'
        return unless selectedIssue?
        selectedIssueView = @children.findByModel selectedIssue
        selectedIssueView.$(".js-issue-#{action}").click()

      super

      key 'right', 'list', =>
        selectedIssue = @collection.at @options.app.state.get 'selectedIndex'
        @options.app.controller.showComponentViewer selectedIssue
        return false

      key 'f', 'list', -> doAction 'transition'
      key 'a', 'list', -> doAction 'assign'
      key 'm', 'list', -> doAction 'assign-to-me'
      key 'p', 'list', -> doAction 'plan'
      key 'i', 'list', -> doAction 'set-severity'
      key 'c', 'list', -> doAction 'comment'
      key 't', 'list', -> doAction 'edit-tags'


    scrollTo: ->
      selectedIssue = @collection.at @options.app.state.get 'selectedIndex'
      return unless selectedIssue?
      selectedIssueView = @children.findByModel selectedIssue
      parentTopOffset = @$el.offset().top
      viewTop = selectedIssueView.$el.offset().top - parentTopOffset
      if selectedIssueView.$el.prev().is('.issues-workspace-list-component')
        viewTop -= COMPONENT_HEIGHT
      viewBottom = selectedIssueView.$el.offset().top + selectedIssueView.$el.outerHeight() + BOTTOM_OFFSET
      windowTop = $(window).scrollTop()
      windowBottom = windowTop + $(window).height()
      if viewTop < windowTop
        $(window).scrollTop viewTop
      if viewBottom > windowBottom
        $(window).scrollTop $(window).scrollTop() - windowBottom + viewBottom


    appendHtml: (compositeView, itemView, index) ->
      $container = this.getItemViewContainer compositeView
      model = @collection.at(index)
      if model?
        prev = @collection.at(index - 1)
        putComponent = !prev?
        if prev?
          fullComponent = [model.get('project'), model.get('component')].join ' '
          fullPrevComponent = [prev.get('project'), prev.get('component')].join ' '
          putComponent = true unless fullComponent == fullPrevComponent
        if putComponent
          $container.append @componentTemplate model.toJSON()
      $container.append itemView.el


    closeChildren: ->
      super
      @$('.issues-workspace-list-component').remove()
