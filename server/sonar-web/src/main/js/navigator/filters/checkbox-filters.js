define([
  'navigator/filters/base-filters',
  'templates/navigator'
], function (BaseFilters) {

  return BaseFilters.BaseFilterView.extend({
    template: Templates['checkbox-filter'],
    className: 'navigator-filter navigator-filter-inline',


    events: function() {
      return {
        'click .navigator-filter-disable': 'disable'
      };
    },


    showDetails: function() {},


    renderInput: function() {
      if (this.model.get('enabled')) {
        $j('<input>')
            .prop('name', this.model.get('property'))
            .prop('type', 'checkbox')
            .prop('value', 'true')
            .prop('checked', true)
            .css('display', 'none')
            .appendTo(this.$el);
      }
    },


    renderValue: function() {
      return this.model.get('value');
    },


    isDefaultValue: function() {
      return false;
    },


    restore: function(value) {
      this.model.set({
        value: value,
        enabled: true
      });
    }

  });

});
