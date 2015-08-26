define([
  'backbone',
  './report'
], function (Backbone, Report) {

  return Backbone.Collection.extend({
    model: Report,
    url: '',

    parse: function (r) {
      this.total = r.total || r.reports.length;
      this.p = r.p || 1;
      this.ps = r.ps;
      return r.reports;
    },

    fetch: function (options) {
      var opts = _.defaults(options || {}, { q: this.q }, { q: 'history' });
      opts.url = window.baseUrl + '/api/computation/' + opts.q;
      this.q = opts.q;
      return Backbone.Collection.prototype.fetch.call(this, opts);
    },

    fetchMore: function () {
      var p = this.p + 1;
      return this.fetch({ add: true, remove: false, data: { p: p, ps: this.ps } });
    },

    hasMore: function () {
      return this.total > this.p * this.ps;
    }

  });

});
