Base.ItemView = Marionette.ItemView.extend({

  showError(xhr, defaultMessage) {
    if (this.alert) {
      this.alert.fadeIn()
    } else {
      if (xhr === null) {
        this.showAlertMessage(defaultMessage)
      } else {
        const errorText = this.getErrorText(xhr)
        this.showAlertMessage(errorText)
      }
    }
  },

  showAlertMessage(text, type) {
    if (type === undefined) {
      type = 'alert'
    }
    this.alert = $(`<div class='alert-box ${type}'>${text}</div>`)
    this.$el.append(this.alert)
  },

  hideAlertMessage(now) {
    if (this.alert) {
      if (now) {
        this.alert.hide()
      } else {
        this.alert.fadeOut()
      }
      this.alert = null
    }
  },

  getErrorText(xhr) {
    let responseText
    try {
      responseText = JSON.parse(xhr.responseText)
    } catch (error) {
      return 'Verbindungsfehler mit dem Server.'
    }
    if ('error' in responseText) {
      return responseText.error
    } else if ('errors' in responseText) {
      const errors = responseText.errors
      if (typeof errors === 'string') {
        return errors
      } else {
        const errorMessage = this._compileErrorMessage(errors)
        if (errorMessage !== undefined) {
          return errorMessage
        }
      }
    }
    return 'Unbekannter Fehler.'
  },

  _capitalizeFirstLetter(string) {
    if (string === undefined || string.length < 2) {
      throw new Error('Invalid parameter: ${string}.')
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
  },

  _compileErrorMessage(errors) {
    if (errors === undefined || errors.length < 1) {
      return undefined
    }
    const messages = []
    _.each(errors, (error, key) => {
      if (_.isArray(error)) {
        error.map(item => {
          messages.push(`${this._capitalizeFirstLetter(key)} ${item}`)
        })
      }
    })
    if (messages.length > 0) {
      return messages.join(', ')
    } else {
      return undefined
    }
  },

  enterKeyPressed(event) {
    return event && (event.which === 10 || event.which === 13)
  },

  onKeyPress(event) {
    if (this.enterKeyPressed(event)) {
      this.onEnterKeyPressed(event)
    }
  },

  onEnterKeyPressed(event) {
    // Overwrite in subclass if needed.
  },

  closeView() {
    this.$el.trigger('reveal:close')
  },

  focusFirstFormField(form) {
    let firstInput = form.find(':input:first')
    if (_.isObject(firstInput)) {
      if (firstInput.length > 0) {
        firstInput = firstInput[0]
      }
    }
    _.defer(() => {
      firstInput.focus()
    })
  }

})
