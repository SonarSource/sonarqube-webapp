define([
  './create-view',
  './templates'
], function (CreateView) {

  return Marionette.ItemView.extend({
    template: Templates['custom-measures-header'],

    events: {
      'click #custom-measures-create': 'onCreateClick'
    },

    onCreateClick: function (e) {
      e.preventDefault();
      this.createCustomMeasure();
    },

    createCustomMeasure: function () {
      new CreateView({
        collection: this.collection,
        projectId: this.options.projectId
      }).render();
    }
  });

});
