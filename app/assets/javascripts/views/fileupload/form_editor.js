Teikei.module("FileUpload", function(FileUpload, App, Backbone, Marionette, $, _) {

  FileUpload.FormEditor = Backbone.Form.editors.Base.extend({

    template: JST["fileupload/form_editor"],

    ui: {
      fileuploader: '#fileupload',
      progressmeter: '.progress .meter',
      previewImage: '#previewimage'
    },

    events: {
      'change': function() {
        this.trigger('change', this);
      },
      'focus': function() {
        this.trigger('focus', this);
      },
      'blur': function() {
        this.trigger('blur', this);
      }
    },

    initialize: function(options) {
      _.bindAll( this, 'render' );

      // Call parent constructor
      Backbone.Form.editors.Base.prototype.initialize.call(this, options);
    },

    render: function() {
      this.$el.html( this.template );

      var url = 'api/v1/images';
      new Marionette.View().bindUIElements.call(this);

      var progressmeter = this.ui.progressmeter;
      var previewImage = this.ui.previewImage;

      this.ui.fileuploader.fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
          var url = data.result[0].thumbnail_url;
          previewImage.attr('src', url);
        },
        drop: function( e, data) {
          progressmeter.css('width: 0px');
        },
        change: function(e, data) {
          progressmeter.css('width: 0px');
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          progressmeter.css(
            'width',
            progress + '%'
          );
        }
      });
      return this;
    },

    showError: function(message) {
      // this.ui.alertBox.html(message.error);
      // this.ui.alertBox.show();
    },

  });
});
