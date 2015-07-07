Teikei.module("Base", function(Base, Teikei, Backbone, Marionette, $, _) {

  Base.ItemView = Marionette.ItemView.extend({

    showError: function(xhr, defaultMessage) {
      if (this.alert) {
        this.alert.fadeIn();
      }
      else {
        if (xhr === null) {
          this.showAlertMessage(defaultMessage);
        }
        else {
          var errorText = this.getErrorText(xhr);
          this.showAlertMessage(errorText);
        }
      }
    },

    showAlertMessage: function(text, type) {
      if (type === undefined) {
        type = "alert";
      }
      this.alert = $("<div class='alert-box " + type + "'>" + text + "</div>");
      this.$el.append(this.alert);
    },

    hideAlertMessage: function(now) {
      if (this.alert) {
        if (now) {
          this.alert.hide();
        }
        else {
          this.alert.fadeOut();
        }
        this.alert = null;
      }
    },

    getErrorText: function(xhr) {
      var responseText;
      try {
        responseText = JSON.parse(xhr.responseText);
      }
      catch (error) {
        return "Verbindungsfehler mit dem Server.";
      }
      // Custom error.
      if ("error" in responseText) {
        return responseText.error;
      }
      // Devise errors.
      else if ("errors" in responseText) {
        var errors = responseText.errors;
        if (Teikei.Util.isString(errors)) {
          return errors;
        }
        else {
          var errorMessage = this._compileErrorMessage(errors);
          if (errorMessage !== undefined) {
            return errorMessage;
          }
        }
      }
      return "Unbekannter Fehler.";
    },

    _capitalizeFirstLetter: function(string) {
      if (string === undefined || string.length < 2) {
        throw "Invalid parameter: `" + string + "`.";
      }
      return string.charAt(0).toUpperCase() + string.slice(1);
    },

    _compileErrorMessage: function(errors) {
      if (errors === undefined || errors.length < 1) {
        return undefined;
      }
      var messages = [];
      _.each(errors, function(error, key) {
        if (_.isArray(error)) {
          error.map(function(item) {
            messages.push(this._capitalizeFirstLetter(key) + " " + item);
          });
        }
      });
      if (messages.length > 0) {
        return messages.join(", ");
      }
      else {
        return undefined;
      }
    },

    enterKeyPressed: function(event) {
      return event && (event.which == 10 || event.which == 13);
    },

    onKeyPress: function(event) {
      if (this.enterKeyPressed(event)) {
        this.onEnterKeyPressed(event);
      }
    },

    onEnterKeyPressed: function(event) {
      // Overwrite in subclass if needed.
    },

    closeView: function() {
      this.$el.trigger("reveal:close");
    },

    focusFirstFormField: function(form) {
      var firstInput = form.find(':input:first');
      if (_.isObject(firstInput)) {
        if (firstInput.length > 0) {
          firstInput = firstInput[0];
        }
      }
      _.defer(function() {
        firstInput.focus();
      });
    }

  });

});
