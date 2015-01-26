define([
  'templates/coding-rules'
], function () {

  var $ = jQuery;

  return Marionette.Layout.extend({
    template: Templates['coding-rules-layout'],

    regions: {
      filtersRegion: '.search-navigator-filters',
      facetsRegion: '.search-navigator-facets',
      workspaceHeaderRegion: '.search-navigator-workspace-header',
      workspaceListRegion: '.search-navigator-workspace-list',
      workspaceDetailsRegion: '.search-navigator-workspace-details'
    },

    initialize: function () {
      var that = this;
      this.topOffset = 0;
      $(window).on('scroll.search-navigator-layout', function () {
        that.onScroll();
      });
    },

    onClose: function () {
      $(window).off('scroll.search-navigator-layout');
    },

    onRender: function () {
      var top = $('.search-navigator').offset().top;
      this.topOffset = top;
      this.$('.search-navigator-side').css({ top: top }).isolatedScroll();
    },

    onScroll: function () {
      var scrollTop = $(window).scrollTop();
      $('.search-navigator').toggleClass('sticky', scrollTop >= this.topOffset);
      this.$('.search-navigator-side').css({
        top: Math.max(0, Math.min(this.topOffset - scrollTop, this.topOffset))
      });
    },

    showDetails: function () {
      this.scroll = $(window).scrollTop();
      $('.search-navigator').addClass('search-navigator-extended-view');
    },


    hideDetails: function () {
      $('.search-navigator').removeClass('search-navigator-extended-view');
      if (this.scroll != null) {
        $(window).scrollTop(this.scroll);
      }
    }

  });

});
