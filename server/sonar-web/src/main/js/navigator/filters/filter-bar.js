define(
    [
      'backbone.marionette',
      'navigator/filters/base-filters',
      'navigator/filters/more-criteria-filters',
      'navigator/filters/favorite-filters',
      'common/handlebars-extensions'
    ],
    function (Marionette, BaseFilters) {

      return Marionette.CompositeView.extend({
        itemViewContainer: '.navigator-filters-list',


        collectionEvents: {
          'change:enabled': 'changeEnabled'
        },


        getItemView: function (item) {
          return item.get('type') || BaseFilters.BaseFilterView;
        },


        itemViewOptions: function () {
          return {
            filterBarView: this,
            app: this.options.app
          };
        },


        initialize: function () {
          Marionette.CompositeView.prototype.initialize.apply(this, arguments);

          var that = this;
          $j('body').on('click', function () {
            that.hideDetails();
          });
          this.addMoreCriteriaFilter();

          key.filter = function(e) {
            var el = jQuery(e.target),
                box = el.closest('.navigator-filter-details-inner'),
                tabbableSet = box.find(':tabbable');

            if (el.closest('.ui-dialog').length > 0 && (el.is(':input') || el.is('a'))) {
              return false;
            }

            if (el.is(':input') || el.is('a')) {
              if (e.keyCode === 9 || e.keyCode === 27) {
                return tabbableSet.index(el) >= tabbableSet.length - 1;
              }
              return false;
            }

            return true;
          };
          key('tab', 'list', function() {
            key.setScope('filters');
            that.selectFirst();
            return false;
          });
          key('shift+tab', 'filters', function() {
            that.selectPrev();
            return false;
          });
          key('tab', 'filters', function() {
            that.selectNext();
            return false;
          });
          key('escape', 'filters', function() {
            that.hideDetails();
            this.selected = -1;
            key.setScope('list');
          });
        },


        getEnabledFilters: function() {
          return this.$(this.itemViewContainer).children()
              .not('.navigator-filter-disabled')
              .not('.navigator-filter-inactive')
              .not('.navigator-filter-favorite');
        },


        selectFirst: function() {
          this.selected = -1;
          this.selectNext();
        },


        selectPrev: function() {
          var filters = this.getEnabledFilters();
          if (this.selected > 0) {
            filters.eq(this.selected).blur();
            this.selected--;
            filters.eq(this.selected).click();
            this.$('.navigator-filter-submit').blur();
          }
        },


        selectNext: function() {
          var filters = this.getEnabledFilters();
          if (this.selected < filters.length - 1) {
            filters.eq(this.selected).blur();
            this.selected++;
            filters.eq(this.selected).click();
          } else {
            this.selected = filters.length;
            this.hideDetails();
            this.$('.navigator-filter-submit').focus();
          }
        },


        addMoreCriteriaFilter: function() {
          var disabledFilters = this.collection.where({ enabled: false });
          if (disabledFilters.length > 0) {
            this.moreCriteriaFilter = new BaseFilters.Filter({
              type: require('navigator/filters/more-criteria-filters').MoreCriteriaFilterView,
              enabled: true,
              optional: false,
              filters: disabledFilters
            });
            this.collection.add(this.moreCriteriaFilter);
          }
        },


        onAfterItemAdded: function (itemView) {
          if (itemView.model.get('type') === require('navigator/filters/favorite-filters').FavoriteFilterView) {
            jQuery('.navigator-header').addClass('navigator-header-favorite');
          }
        },


        restoreFromQuery: function (q) {
          this.collection.each(function (item) {
            item.set('enabled', !item.get('optional'));
            item.view.clear();
            item.view.restoreFromQuery(q);
          });
        },


        hideDetails: function () {
          if (_.isObject(this.showedView)) {
            this.showedView.hideDetails();
          }
        },


        enableFilter: function (id) {
          var filter = this.collection.get(id),
              filterView = filter.view;

          filterView.$el.detach().insertBefore(this.$('.navigator-filter-more-criteria'));
          filter.set('enabled', true);
          filterView.showDetails();
        },


        changeEnabled: function () {
          var disabledFilters = _.reject(this.collection.where({ enabled: false }), function (filter) {
            return filter.get('type') === require('navigator/filters/more-criteria-filters').MoreCriteriaFilterView;
          });

          if (disabledFilters.length === 0) {
            this.moreCriteriaFilter.set({ enabled: false }, { silent: true });
          } else {
            this.moreCriteriaFilter.set({ enabled: true }, { silent: true });
          }
          this.moreCriteriaFilter.set('filters', disabledFilters);
        }

      });

    });
