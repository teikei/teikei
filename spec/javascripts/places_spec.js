describe("Places", function() {

  var placesController;

  beforeEach(function () {
    Teikei.Places.collection = new Teikei.Entities.Places(fixtures.placesData);
    placesController = Teikei.Places.Controller;
  });

  afterEach(function () {
    Teikei.Places.mapView.markers = [];
  });

  it("should contain a collection.", function() {
    expect(Teikei.Places.collection).toBeInstanceOf(Teikei.Entities.Places);
  });

  it("should contain a MapView.", function() {
    expect(Teikei.Places.mapView).toBeInstanceOf(Teikei.Places.MapView);
  });

  it("should contain a DetailsView when #showDetails is called.", function() {
    placesController.showDetails(1);
    expect(Teikei.Places.detailsView).toBeInstanceOf(Teikei.Places.DetailsView);
  });

  it("should contain a DetailsMessageFormView when #showDetails is called.", function() {
    placesController.showDetails(1);
    expect(Teikei.Places.detailsView).toBeInstanceOf(Teikei.Places.DetailsMessageFormView);
  });

  describe("Collection", function() {

    it ("should contain Places models", function() {
      expect(Teikei.Places.collection.model).toEqual(Teikei.Entities.Place);
    });

    describe("#byType", function() {

      it("should return a Places collection", function() {
        var farms = Teikei.Places.collection.byType("Farm");

        expect(farms).toBeInstanceOf(Teikei.Entities.Places);
      });

      it("should return Farm objects when being queried for Farms", function() {
        var farms = Teikei.Places.collection.byType("Farm");

        farms.each(function(place) {
          expect(place.get("type")).toEqual("Farm");
        });
      });

      it("should return Depot objects when being queried for Depots", function() {
        var farms = Teikei.Places.collection.byType("Depot");

        farms.each(function(place) {
          expect(place.get("type")).toEqual("Depot");
        });
      });

    });

    describe("#byUserId", function() {

      it("should return an empty Places collection for an unknown user", function() {
        var places = Teikei.Places.collection.byUserId(23);
        expect(places.length).toEqual(0);
      });

      it("should return a Place collection owned by the given user", function() {
        var places = Teikei.Places.collection.byUserId(4);
        expect(places.length).toEqual(2);
      });

    });
  });

  describe("MapView", function() {

    it("should be initialized with a collection", function() {
      expect(Teikei.Places.mapView.collection).toBeInstanceOf(Teikei.Entities.Places);
    });

    it("should initialize a marker layer using model data.", function() {
      var model = Teikei.Places.collection.models[0];
      var markerLayer = Teikei.Places.mapView.initMarker(model);

      expect(markerLayer).toBeInstanceOf(L.Marker);
    });

    it("should initialize a marker layer using collection data.", function() {
      var markerLayer = Teikei.Places.mapView.initMarkerLayer(Teikei.Places.collection);

      expect(markerLayer).toBeInstanceOf(L.LayerGroup);
    });

    it("should initialize a tiles layer.", function() {
      var tileLayer = Teikei.Places.mapView.initTileLayer();

      expect(tileLayer).toBeInstanceOf(L.TileLayer);
    });

    it("should initialize a tiles layer.", function() {
      var tileLayer = Teikei.Places.mapView.initTileLayer();

      expect(tileLayer).toBeInstanceOf(L.TileLayer);
    });

    it("should initialize a tooltip for a certain id.", function() {
      var model = Teikei.Places.collection.models[0];
      Teikei.Places.mapView.initMarkerLayer(Teikei.Places.collection);

      spyOn(Teikei.Places.mapView, "initTip");

      Teikei.Places.mapView.showTip(model.id);
      expect(Teikei.Places.mapView.initTip).toHaveBeenCalled();
    });

  });

  describe("EntryView", function(){

    beforeEach(function() {
      runs(function() {
        Teikei.vent.trigger("user:add:depot");
      });
    });

    it("should be rendered within the modal region when user:add:depot is triggered", function() {
      runs(function() {
        expect(Teikei.modalRegion.currentView).toEqual(Teikei.Places.entryView);
      });
    });

    // Pending. Those fields don't exist anymore. Replaced by custom form field.
    // TODO: Find out how to best test the custom form field.
    xit("contains queryable input fields for address and city", function() {
      expect(placesController.entryView.ui.addressInput.val()).toBeDefined();
      expect(placesController.entryView.ui.cityInput.val()).toBeDefined();
    });

    // FIXME: doesn't work as the reveal modal is not really working in this test setup
    // it("should be closed when the containing modal is closed", function() {
    //   runs(function() {
    //     placesController.entryView.render();
    //     placesController.entryView.$el.trigger("reveal:close");
    //   });

    //   waitsFor(function() {
    //     return placesController.entryView.isClosed === true;
    //   }, 1000, "entryView to be closed");

    //   runs(function() {
    //     expect(Teikei.placesEntryPopup.currentView).toClosed();
    //   });
    // });

  });

  describe("EntryFarmView", function() {

    beforeEach(function() {
      spyOn(placesController, "showEntryForm").andCallThrough();
      Teikei.vent.trigger('user:add:farm');
    });

    it("should be initialized when user:add:farm is triggered", function() {
      expect(placesController.showEntryForm).toHaveBeenCalled();
      expect(Teikei.Places.entryView).toBeInstanceOf(Teikei.Places.EntryFarmView);
    });

  });

  describe("EntryDepotView", function(){

    beforeEach(function() {
      spyOn(placesController, "showEntryForm").andCallThrough();
      Teikei.vent.trigger('user:add:depot');
    });

    it("should be initialized when user:add:depot is triggered", function() {
      expect(placesController.showEntryForm).toHaveBeenCalled();
      expect(Teikei.Places.entryView).toBeInstanceOf(Teikei.Places.EntryDepotView);
    });

  });

  describe("DeleteEntryView", function(){

    beforeEach(function() {
      spyOn(placesController, "deleteEntry").andCallThrough();
      var zombiePlace = Teikei.Places.collection.first();
      Teikei.vent.trigger('delete:entry', zombiePlace);
    });

    it("should be initialized when delete:entry is triggered", function() {
      // expect(placesController.deleteEntry).toHaveBeenCalled();
      expect(Teikei.Places.deleteEntryView).toBeInstanceOf(Teikei.Places.DeleteEntryView);
    });

  });

});
