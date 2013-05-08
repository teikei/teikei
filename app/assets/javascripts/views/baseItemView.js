Teikei.module("Base", function(Base, App, Backbone, Marionette, $, _) {

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
          errorText = this.getErrorText(xhr);
          this.showAlertMessage(errorText);
        }
      }
    },

    showAlertMessage: function(text) {
      this.alert = $("<div class='alert-box alert'>" + text + "</div>");
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
      try {
        responseText = JSON.parse(xhr.responseText);
      }
      catch(error) {
        return "Verbindungsfehler mit dem Server.";
      }
      // Custom error.
      if ("error" in responseText) {
        return responseText.error;
      }
      // Devise errors.
      else if ("errors" in responseText) {
        errors = responseText.errors;
        errorText = "";
        _.each(errors, function(error, key) {
          errorText += key + " " + error[0];
        });
        return errorText;
      }
      return "Unbekannter Fehler.";
    },

    onKeyPress: function(event) {
      if (event.which == 10 || event.which == 13) {
        this.onEnterKeyPressed(event);
      }
    },

    onEnterKeyPressed: function(event) {
      // Overwrite in subclass if needed.
    }

  });

});
