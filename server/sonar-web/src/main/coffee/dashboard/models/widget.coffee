define ['backbone'], (Backbone) ->


  class extends Backbone.Model

    mergeProperties: (properties) ->
      props = @get 'properties'
      props = properties.map (prop) ->
        data = _.findWhere props, key: prop.key
        _.extend prop, data
      @set 'properties', props
