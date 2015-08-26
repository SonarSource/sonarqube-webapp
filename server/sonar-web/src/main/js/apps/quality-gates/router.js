define([
  'backbone'
], function (Backbone) {

  return Backbone.Router.extend({
    routes: {
      '': 'index',
      'show/:id': 'show'
    },

    initialize: function (options) {
      this.app = options.app;
    },

    index: function () {
      this.app.controller.index();
    },

    show: function (id) {
      this.app.controller.show(id);
    }
  });

});
