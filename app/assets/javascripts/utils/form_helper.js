Teikei.module("FormHelper", function(FormHelper, Teikei, Backbone, Marionette, $, _) {

  // Fills in model attributes
  FormHelper.prepopulatePlaceModel = function(place) {
    if (place === undefined) {
      throw "IllegalParameterException: Place model cannot be undefined.";
    }

    var currentUser = Teikei.currentUser;
    if (currentUser === undefined) {
      return place;
    }

    // Put currentUser.name into place.contact_name
    var contact_name = place.get("contact_name");
    if (contact_name === undefined || contact_name.length < 1) {
      var name = currentUser.get("name");
      if (name !== undefined && name.length > 0) {
        place.set("contact_name", currentUser.get("name"));
      }
    }

    return place;
  }

});
