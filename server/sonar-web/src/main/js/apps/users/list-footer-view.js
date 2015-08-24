define([
  'backbone.marionette',
  './templates'
], function (Marionette) {

  return Marionette.ItemView.extend({
    template: Templates['users-list-footer'],

    collectionEvents: {
      'all': 'render'
    },

    events: {
      'click #users-fetch-more': 'onMoreClick'
    },

    onMoreClick: function (e) {
      e.preventDefault();
      this.fetchMore();
    },

    fetchMore: function () {
      this.collection.fetchMore();
    },

    serializeData: function () {
      return _.extend(Marionette.ItemView.prototype.serializeData.apply(this, arguments), {
        total: this.collection.total,
        count: this.collection.length,
        more: this.collection.hasMore()
      });
    }
  });

});
