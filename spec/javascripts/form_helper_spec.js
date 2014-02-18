describe("FormHelper", function() {


  describe("Prepopulation when currentUser is present and valid", function() {

    beforeEach(function () {
      Teikei.currentUser = new Teikei.Entities.User({
        name: "John Doe"
      });
    });

    it("throws an IllegalParameterException when the place model is undefined", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      var place = undefined;
      expect(function() {
        Teikei.FormHelper.prepopulatePlaceModel(place);
      }).toThrow("IllegalParameterException: Place model cannot be undefined.");
    });

    it("prepopulates the contact name with the name of the current user if the place model is new", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      var place = new Teikei.Entities.Place();
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(Teikei.currentUser.get("name"));
    });

    it("prepopulates the contact name with the name of the current user if it is empty", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      var place = new Teikei.Entities.Place({
        contact_name: ""
      });
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(Teikei.currentUser.get("name"));
    });

    it("prepopulates the contact name with the name of the current user if it is undefined", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      var place = new Teikei.Entities.Place({
        contact_name: undefined
      });
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(Teikei.currentUser.get("name"));
    });

  });



  describe("Prepopulation when the place model is present and valid", function() {

    var place;

    beforeEach(function () {
      place = new Teikei.Entities.Place({
        contact_name: "Jane Doe"
      });
    });

    it("rejects overwriting an existing contact name in the place model", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      Teikei.currentUser = new Teikei.Entities.User({
        name: "John Doe"
      });
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(place.get("contact_name"));
    });

    it("rejects overwriting the contact name in a place model with an empty string", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      Teikei.currentUser = new Teikei.Entities.User({
        name: ""
      });
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(place.get("contact_name"));
    });

    it("rejects overwriting the contact name in a place model with undefined", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      Teikei.currentUser = new Teikei.Entities.User({
        name: undefined
      });
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(place.get("contact_name"));
    });

    it("rejects overwriting the contact name in a place model when the current user model is new", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      Teikei.currentUser = new Teikei.Entities.User();
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(place.get("contact_name"));
    });

    it("rejects overwriting the contact name in a place model when the current user model is undefined", function() {
      spyOn(Teikei.FormHelper, "prepopulatePlaceModel").andCallThrough();
      Teikei.currentUser = undefined;
      var prepopulatedPlace = Teikei.FormHelper.prepopulatePlaceModel(place);
      expect(prepopulatedPlace.get("contact_name")).toEqual(place.get("contact_name"));
    });

  });


});
