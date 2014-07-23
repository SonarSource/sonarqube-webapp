define [
  'backbone'
  'backbone.marionette'
  'templates/component-viewer'

  'component-viewer/models/state'
  'component-viewer/models/component'
  'component-viewer/models/period'

  'component-viewer/mixins/main-issues'
  'component-viewer/mixins/main-coverage'
  'component-viewer/mixins/main-duplications'
  'component-viewer/mixins/main-scm'

  'component-viewer/workspace'
  'component-viewer/source'
  'component-viewer/header'
  'component-viewer/utils'

  'component-viewer/mockjax'
], (
  Backbone
  Marionette
  Templates

  State
  Component
  Period

  IssuesMixin
  CoverageMixin
  DuplicationsMixin
  SCMMixin

  WorkspaceView
  SourceView
  HeaderView
  utils
) ->

  $ = jQuery

  API_COMPONENT = "#{baseUrl}/api/components/app"
  API_SOURCES = "#{baseUrl}/api/sources/show"
  API_RAW_SOURCES = "#{baseUrl}/api/sources"
  API_MEASURES = "#{baseUrl}/api/resources"
  API_TESTS = "#{baseUrl}/api/tests/show"

  SOURCE_METRIC_LIST = 'accessors,classes,functions,statements,' +
    'ncloc,ncloc_data,lines,generated_ncloc,generated_lines,' +
    'complexity,function_complexity,' +
    'comment_lines,comment_lines_density,public_api,public_undocumented_api,public_documented_api_density'

  COVERAGE_METRIC_LIST = 'coverage,line_coverage,lines_to_cover,covered_lines,uncovered_lines,' +
    'branch_coverage,conditions_to_cover,uncovered_conditions,' +
    'it_coverage,it_line_coverage,it_lines_to_cover,it_covered_lines,it_uncovered_lines,' +
    'it_branch_coverage,it_conditions_to_cover,it_uncovered_conditions,' +
    'overall_coverage,overall_line_coverage,overall_lines_to_cover,overall_covered_lines,overall_uncovered_lines,' +
    'overall_branch_coverage,overall_conditions_to_cover,overall_uncovered_conditions'

  ISSUES_METRIC_LIST = 'blocker_violations,critical_violations,major_violations,minor_violations,info_violations,' +
    'false_positive_issues'

  DUPLICATIONS_METRIC_LIST = 'duplicated_lines_density,duplicated_blocks,duplicated_files,duplicated_lines'

  TESTS_METRIC_LIST = 'tests,test_success_density,test_failures,test_errors,skipped_tests,test_execution_time'

  SCROLL_OFFSET = 10



  class ComponentViewer extends utils.mixOf Marionette.Layout, IssuesMixin, CoverageMixin, DuplicationsMixin, SCMMixin
    className: 'component-viewer'
    template: Templates['cw-layout']


    regions:
      workspaceRegion: '.component-viewer-workspace'
      headerRegion: '.component-viewer-header'
      sourceRegion: '.component-viewer-source'


    initialize: (options) ->
      @settings = new Backbone.Model @getDefaultSettings()
      if options.settings?
        options.settings = JSON.parse(options.settings) if typeof options.settings == 'string'
        @settings.set options.settings
      @settings.set 'scm', !!localStorage.getItem('componentViewerSCM')
      @shouldStoreSettings = options.shouldStoreSettings
      @elementToFit = options.elementToFit

      @state = new State()

      @component = new Component()
      @component.set options.component if options.component?

      @workspace = new Backbone.Collection()
      @workspaceView = new WorkspaceView
        collection: @workspace
        main: @

      @source = new Backbone.Model()
      @sourceView = new SourceView
        model: @source
        main: @

      @headerView = new HeaderView
        model: @source
        main: @

      @periods = new Backbone.Collection [], model: Period


    getDefaultSettings: ->
      issues: false
      coverage: false
      duplications: false
      scm: false
      workspace: false


    storeSettings: ->
      scm = if @settings.get('scm') then 'scm' else ''
      localStorage.setItem 'componentViewerSCM', scm
      if @shouldStoreSettings
        localStorage.setItem 'componentViewerSettings', JSON.stringify @settings.toJSON()


    fitIntoElement: ->
      return unless @elementToFit
      source = @$(@sourceRegion.$el)
      workspace = @$(@workspaceRegion.$el)

      width = @elementToFit.width()
      height = @elementToFit.height()
      availableWidth = width - workspace.outerWidth(true)
      availableHeight = height - @$(@headerRegion.$el).outerHeight(true)

      source.removeClass 'overflow'
      source.width(availableWidth).css('max-height', availableHeight)
      source.addClass 'overflow'
      workspace.removeClass 'overflow'
      workspace.height availableHeight
      workspace.addClass 'overflow'


    onRender: ->
      @workspaceRegion.show @workspaceView
      @$el.toggleClass 'component-viewer-workspace-enabled', @settings.get 'workspace'
      @sourceRegion.show @sourceView
      @headerRegion.show @headerView
      @fitIntoElement()
      resizeEvent = 'resize.componentViewer'
      $(window).off(resizeEvent).on resizeEvent, =>
        setTimeout (=> @fitIntoElement()), 100


    requestComponent: (key, clear = false, full = true) ->
      STATE_FIELDS = ['canBulkChange', 'canMarkAsFavourite', 'canCreateManualIssue',
                      'tabs', 'manual_rules', 'extensions']
      COMPONENT_FIELDS = ['key', 'longName', 'name', 'path', 'q', 'project', 'projectName', 'subProject',
                          'subProjectName', 'measures', 'fav']

      $.get API_COMPONENT, key: key, (data) =>
        # Component
        @component.clear() if clear
        COMPONENT_FIELDS.forEach (f) => @component.set f, data[f]
        if data.path?
          @component.set 'dir', utils.splitLongName(data.path).dir
        @component.set 'isUnitTest', data.q == 'UTS'


        # State
        stateAttributes = {}
        STATE_FIELDS.forEach (f) -> stateAttributes[f] = data[f]
        rules = data.rules.map (r) -> key: r[0], name: r[1], count: r[2]
        stateAttributes.rules = _.sortBy rules, 'name'
        severities = data.severities.map (r) -> key: r[0], name: r[1], count: r[2]
        stateAttributes.severities = utils.sortSeverities severities
        if full
          @state.clear silent: true
          @state.set _.defaults stateAttributes, @state.defaults
        else
          @state.set stateAttributes

        if full
          # Periods
          @periods.reset [{label: t('none')}]
          data.periods.forEach (p) =>
            d = new Date p[2]
            d.setHours 0, 0, 0, 0
            p = @periods.add key: p[0], label: p[1], sinceDate: d


    requestMeasures: (key, period = null) ->
      @state.set 'hasMeasures', true
      return @requestTrends(key, period) if period?
      unless @component.get 'isUnitTest'
        metrics = [SOURCE_METRIC_LIST, COVERAGE_METRIC_LIST, ISSUES_METRIC_LIST, DUPLICATIONS_METRIC_LIST].join ','
      else
        metrics = [ISSUES_METRIC_LIST, TESTS_METRIC_LIST].join ','
      data = resource: key, metrics: metrics
      $.get API_MEASURES, data, (data) =>
        measuresList = data[0].msr || []
        measures = @component.get 'measures'
        measuresList.forEach (m) ->
          measures[m.key] = m.frmt_val || m.data
        @component.set 'measures', measures
        @augmentWithNclocData()


    requestTrends: (key, period) ->
      unless @component.get 'isUnitTest'
        metrics = COVERAGE_METRIC_LIST
      else
        metrics = ''
      metrics = metrics.split(',').map((m) -> "new_#{m}").join ','
      data = resource: key, metrics: metrics, includetrends: true
      $.get API_MEASURES, data, (data) =>
        measuresList = data[0].msr || []
        measures = @component.get 'measures'
        measuresList.forEach (m) ->
          key = m.key.substr(4)
          variation = "fvar#{period}"
          measures[key] = m[variation]
        @component.set 'measures', measures


    requestSource: (key) ->
      $.get API_SOURCES, key: key, (data) =>
        @source.clear()
        formattedSource = _.map data.sources, (item) => lineNumber: item[0], code: item[1]
        @source.set
          source: data.sources
          formattedSource: formattedSource


    augmentWithNclocData: ->
      nclocDataRaw = @component.has('measures') && @component.get('measures')['ncloc_data']
      if nclocDataRaw?
        formattedSource = @source.get 'formattedSource'
        nclocData = nclocDataRaw.split(';').map (item) ->
          tokens = item.split '='
          lineNumber: +tokens[0]
          executable: tokens[1] == '1'
        nclocData.forEach (n) ->
          line = _.findWhere formattedSource, lineNumber: n.lineNumber
          line.executable = n.executable
        @source.set 'formattedSource', formattedSource


    requestTests: (key) ->
      $.get API_TESTS, key: key, (data) =>
        @state.set 'hasTests', true
        @component.set 'tests', _.sortBy data.tests, 'name'


    open: (key) ->
      @workspace.reset []
      @_open key, false


    _open: (key, showFullSource = true) ->
      @key = key
      @sourceView.showSpinner()
      source = @requestSource key
      component = @requestComponent key
      @currentIssue = null
      component.done =>
        @updateWorkspaceComponents()
        @state.set 'removed', false
        source.always =>
          if source.status == 403
            @state.set 'sourceSecurity', true
          @state.set 'hasSource', (source.status != 404)
          @render()
          @showAllLines() if showFullSource
          if @settings.get('issues')
            @showIssues()
          else
            @hideIssues()
            @trigger 'sized'
          if @settings.get('coverage') then @showCoverage() else @hideCoverage()
          if @settings.get('duplications') then @showDuplications() else @hideDuplications()
          if @settings.get('scm') then @showSCM() else @hideSCM()
          @trigger 'loaded'
      .fail (r) =>
        if component.status == 404
          @state.set 'removed', true
          @state.set 'removedMessage', _.pluck(r.responseJSON.errors, 'msg').join '. '
          @state.set 'hasSource', false
          @render()
          @trigger 'loaded'
        else @cannotOpen()


    updateWorkspaceComponents: ->
      @workspace.where(key: @component.get('key')).forEach (model) =>
        model.set 'component': @component.toJSON()

      @workspace.each (w) =>
        options =  w.get('options')
        _.where(options, key: @component.get('key')).forEach (model) =>
          model.component = @component.toJSON()
        w.set 'options', options


    cannotOpen: ->
      @$el.html "<div class='message-error'>#{t 'component_viewer.cannot_show'}</div>"


    toggleWorkspace: (store = false) ->
      if @settings.get 'workspace' then @hideWorkspace() else @showWorkspace()
      @fitIntoElement()
      @storeSettings() if store


    showWorkspace: (store = false) ->
      @settings.set 'workspace', true
      @storeSettings() if store
      @$el.addClass 'component-viewer-workspace-enabled'
      @workspaceView.render()


    hideWorkspace: (store = false) ->
      @settings.set 'workspace', false
      @storeSettings() if store
      @$el.removeClass 'component-viewer-workspace-enabled'
      @workspaceView.render()


    showAllLines: ->
      @sourceView.resetShowBlocks()
      @sourceView.showBlocks.push from: 0, to: _.size @source.get 'source'
      @sourceView.render()


    hideAllLines: ->
      @sourceView.resetShowBlocks()
      @sourceView.render()


    showRawSources: ->
      key = encodeURIComponent @component.get 'key'
      url = "#{API_RAW_SOURCES}?resource=#{key}&format=txt"
      location.href = url


    enablePeriod: (periodKey, activeHeaderItem) ->
      period = if periodKey == '' then null else @periods.findWhere key: periodKey
      @state.set 'period', period
      $.when(@requestMeasures(@key, period?.get('key')), @requestIssuesPeriod(@key, period?.get('key')), @requestSCM(@key)).done =>
        if activeHeaderItem?
          @state.set 'activeHeaderItem', activeHeaderItem
          @headerView.render()
        else @filterBySCM()


    addTransition: (transition, options) ->
      @workspace.add
        key: @component.get 'key'
        component: @component.toJSON()
        transition: transition
        options: options
        active: false


    scrollToLine: (line) ->
      row = @sourceView.$(".row[data-line-number=#{line}]")
      unless row.length > 0
        unless @scrolled
          setTimeout (=> @scrollToLine(line)), 100
        return
      @scrolled = line
      d = row.offset().top - @$(@sourceRegion.$el).offset().top + @$(@sourceRegion.$el).scrollTop() - SCROLL_OFFSET
      @scrollPlusDelta d


    scrollPlusDelta: (delta) ->
      @$(@sourceRegion.$el).scrollTop delta


    _filterByLines: (predicate) ->
      formattedSource = @source.get 'formattedSource'
      @sourceView.resetShowBlocks()
      formattedSource.forEach (line) =>
        if predicate line
          ln = line.lineNumber
          @sourceView.addShowBlock ln, ln
      @sourceView.render()


    filterByLines: ->
      @showAllLines()


    filterByNcloc: ->
      @_filterByLines (line) -> line?.executable
