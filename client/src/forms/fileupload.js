require('imports?define=>false!blueimp-file-upload')

Backbone.Form.editors.FileUpload = Backbone.Form.editors.Base.extend({

  template: JST['form_editors/fileupload'],

  ui: {
    fileuploader: '#fileupload',
    progressmeter: '.progress .meter',
    previewImage: '#previewimage'
  },

  events: {
    'change'() {
      this.trigger('change', this)
    },
    'focus'() {
      this.trigger('focus', this)
    },
    'blur'() {
      this.trigger('blur', this)
    }
  },

  initialize(options) {
    _.bindAll(this, 'render')

    // Call parent constructor
    Backbone.Form.editors.Base.prototype.initialize.call(this, options)
    this.model = {}
  },

  render() {
    this.$el.html(this.template)

    const url = 'api/v1/images'
    new Marionette.View().bindUIElements.call(this)

    const editor = this

    this.ui.fileuploader.fileupload({
      url,
      dataType: 'json',
      done(e, data) {
        editor.setValue(data.result)
      },
      drop(e, data) {
        editor.setProgress(0)
      },
      change(e, data) {
        editor.setProgress(0)
      },
      progressall(e, data) {
        const progress = parseInt(data.loaded / data.total * 100, 10)
        editor.setProgress(progress)
      }
    })
    return this
  },

  setValue(value) {
    if (!value) {
      return
    }
    this.model = value
    this.ui.previewImage.attr('src', value.thumbnail_url)
    this.setProgress(100)
  },

  getValue() {
    return this.model
  },

  setProgress(percentage) {
    this.ui.progressmeter.css('width', `${percentage}%`)
  },

  showError(message) {
    // this.ui.alertBox.html(message.error);
    // this.ui.alertBox.show();
  }

})
