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
    },

    // Selects the tab to be active and deselects the others.
    // The 2nd parameter has to passed as an Array.
    activateTab: function(toBeActive, toBeInactives) {
      _.each(toBeInactives, function(toBeInactive) {
        // Need to talk to parent <dd> element in template.
        toBeInactive.parent().removeClass("active");
      });
      toBeActive.parent().addClass("active");
    },

    // Selects the pane to be active and deselects the others.
    // The 2nd parameter has to passed as an Array.
    activatePane: function(toBeActive, toBeInactives) {
      _.each(toBeInactives, function(toBeInactive) {
        toBeInactive.removeClass("active");
      });
      toBeActive.addClass("active");
    }

  });

});
