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
  'issues/facets/custom-values-facet'
], (
  CustomValuesFacet
) ->


  class extends CustomValuesFacet

    prepareSearch: ->
      url = "#{baseUrl}/api/rules/search?f=name,langName"
      languages = @options.app.state.get('query').languages
      if languages?
        url += "&languages=#{languages}"
      @$('.js-custom-value').select2
        placeholder: 'Search...'
        minimumInputLength: 2
        allowClear: false
        formatNoMatches: -> t 'select2.noMatches'
        formatSearching: -> t 'select2.searching'
        formatInputTooShort: -> tp 'select2.tooShort', 2
        width: '100%'
        ajax:
          quietMillis: 300
          url: url
          data: (term, page) -> { q: term, p: page }
          results: (data) ->
            results = data.rules.map (rule) ->
              id: rule.key, text: "(#{rule.langName}) #{rule.name}"
            { more: (data.p * data.ps < data.total), results: results }


    getValuesWithLabels: ->
      values = @model.getValues()
      rules = @options.app.facets.rules
      values.forEach (v) =>
        key = v.val
        label = ''
        extra = ''
        if key
          rule = _.findWhere rules, key: key
          label = rule.name if rule?
          extra = rule.langName if rule?
        v.label = label
        v.extra = extra
      values


    serializeData: ->
      _.extend super,
        values: @sortValues @getValuesWithLabels()
