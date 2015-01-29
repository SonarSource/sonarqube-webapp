define([
  'templates/coding-rules'
], function () {

  return Marionette.ItemView.extend({
    template: Templates['coding-rules-rule-meta'],

    modelEvents: {
      'change': 'render'
    },

    ui: {
      tagsChange: '.coding-rules-detail-tags-change',
      tagInput: '.coding-rules-detail-tag-input',
      tagsEdit: '.coding-rules-detail-tag-edit',
      tagsEditDone: '.coding-rules-detail-tag-edit-done',
      tagsEditCancel: '.coding-rules-details-tag-edit-cancel',
      tagsList: '.coding-rules-detail-tag-list'
    },

    events: {
      'click @ui.tagsChange': 'changeTags',
      'click @ui.tagsEditDone': 'editDone',
      'click @ui.tagsEditCancel': 'cancelEdit'
    },

    onRender: function () {
      this.$('[data-toggle="tooltip"]').tooltip({
        container: 'body'
      });
    },

    onClose: function () {
      this.$('[data-toggle="tooltip"]').tooltip('destroy');
    },

    requestTags: function () {
      var url = baseUrl + '/api/rules/tags';
      return jQuery.get(url);
    },

    changeTags: function () {
      var that = this;
      this.requestTags().done(function (r) {
        that.ui.tagInput.select2({
          tags: _.difference(_.difference(r.tags, that.model.get('tags')), that.model.get('sysTags')),
          width: '300px'
        });

        that.ui.tagsEdit.removeClass('hidden');
        that.ui.tagsList.addClass('hidden');
        that.tagsBuffer = that.ui.tagInput.select2('val');
        that.ui.tagInput.select2('open');
      });
    },

    cancelEdit: function () {
      this.ui.tagsList.removeClass('hidden');
      this.ui.tagsEdit.addClass('hidden');
      if (this.ui.tagInput.select2) {
        this.ui.tagInput.select2('val', this.tagsBuffer);
        this.ui.tagInput.select2('close');
      }
    },

    editDone: function () {
      var that = this,
          p = window.process.addBackgroundProcess(),
          tags = this.ui.tagInput.val();
      return jQuery.ajax({
        type: 'POST',
        url: baseUrl + '/api/rules/update',
        data: {
          key: this.model.get('key'),
          tags: tags
        }
      }).done(function (r) {
        that.model.set('tags', r.rule.tags);
        that.cancelEdit();
        window.process.finishBackgroundProcess(p);
      }).always(function () {
        that.cancelEdit();
        window.process.failBackgroundProcess(p);
      });
    },

    serializeData: function () {
      return _.extend(Marionette.ItemView.prototype.serializeData.apply(this, arguments), {
        canWrite: this.options.app.canWrite,
        subCharacteristic: this.options.app.getSubCharacteristicName(this.model.get('debtSubChar')),
        allTags: _.union(this.model.get('sysTags'), this.model.get('tags')),
        permalink: baseUrl + '/coding_rules/show?key=' + encodeURIComponent(this.model.id)
      });
    }
  });

});
