describe("Places", function() {

  var collection;
  var placesController;

  beforeEach(function () {
    collection = new Teikei.Places.Collection(fixtures.placesData);
    placesController = new Teikei.Places.Controller();
    placesController.collection = collection;
  });

  afterEach(function () {
    placesController.mapView.markers = [];
  });

  it("should contain a collection.", function() {
    expect(placesController.collection).toBeInstanceOf(Teikei.Places.Collection);
  });

  it("should contain a MapView.", function() {
    expect(placesController.mapView).toBeInstanceOf(Teikei.Places.MapView);
  });

  it("should contain a DetailsView when #showDetails is called.", function() {
    placesController.showDetails(1);
    expect(placesController.detailsView).toBeInstanceOf(Teikei.Places.DetailsView);
  });

  it("should contain a DetailsMessageFormView when #showDetails is called.", function() {
    placesController.showDetails(1);
    expect(placesController.detailsView).toBeInstanceOf(Teikei.Places.DetailsMessageFormView);
  });

  describe("Collection", function() {

    it ("should contain Places models", function() {
      expect(placesController.collection.model).toEqual(Teikei.Places.Model);
    });

    describe("#byType", function() {

      it("should return a Places collection", function() {
        var farms = placesController.collection.byType("Farm");

        expect(farms).toBeInstanceOf(Teikei.Places.Collection);
      });

      it("should return Farm objects when being queried for Farms", function() {
        var farms = placesController.collection.byType("Farm");

        farms.each(function(place) {
          expect(place.get("type")).toEqual("Farm");
        });
      });

      it("should return Depot objects when being queried for Depots", function() {
        var farms = placesController.collection.byType("Depot");

        farms.each(function(place) {
          expect(place.get("type")).toEqual("Depot");
        });
      });

    });
  });

  describe("MapView", function() {

    it("should be initialized with a collection", function() {
      expect(placesController.mapView.collection).toBeInstanceOf(Teikei.Places.Collection);
    });

    it("should initialize a marker layer using model data.", function() {
      var model = placesController.collection.models[0];
      var markerLayer = placesController.mapView.initMarker(model);

      expect(markerLayer).toBeInstanceOf(L.Marker);
    });

    it("should initialize a marker layer using collection data.", function() {
      var markerLayer = placesController.mapView.initMarkerLayer(collection);

      expect(markerLayer).toBeInstanceOf(L.LayerGroup);
    });

    it("should initialize a tiles layer.", function() {
      var tileLayer = placesController.mapView.initTileLayer();

      expect(tileLayer).toBeInstanceOf(L.TileLayer);
    });

    it("should initialize a tiles layer.", function() {
      var tileLayer = placesController.mapView.initTileLayer();

      expect(tileLayer).toBeInstanceOf(L.TileLayer);
    });

    it("should initialize a tooltip for a certain id.", function() {
      var model = collection.models[0];
      placesController.mapView.initMarkerLayer(collection);

      spyOn(placesController.mapView, "initTip");

      placesController.mapView.showTip(model.id);
      expect(placesController.mapView.initTip).toHaveBeenCalled();
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
        expect(Teikei.modalRegion.currentView).toEqual(placesController.entryView);
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
      expect(placesController.entryView).toBeInstanceOf(Teikei.Places.EntryFarmView);
    });

  });

  describe("EntryDepotView", function(){

    beforeEach(function() {
      spyOn(placesController, "showEntryForm").andCallThrough();
      Teikei.vent.trigger('user:add:depot');
    });

    it("should be initialized when user:add:depot is triggered", function() {
      expect(placesController.showEntryForm).toHaveBeenCalled();
      expect(placesController.entryView).toBeInstanceOf(Teikei.Places.EntryDepotView);
    });

  });

});
