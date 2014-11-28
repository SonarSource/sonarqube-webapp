define [
  'templates/issue'
  'common/popup'
], (
  Templates
  PopupView
) ->


  class extends PopupView
    template: Templates['issue-more-actions']


    events: ->
      'click .js-issue-action': 'action'


    action: (e) ->
      actionKey = $(e.currentTarget).data 'action'
      @options.detailView.action actionKey
