describe("Places", function() {

  var placesController;
  var collection;

  beforeEach(function () {
    placesController = new Teikei.Places.Controller();

    collection = new Teikei.Places.Collection([
    {
      id: 1,
      name: "Gutshof Neuruppin",
      city: "Neuruppin",
      address: "Fehrbelliner Str. 45a",
      latitude: "52.913923",
      longitude: "12.8021913",
      accepts_new_members: "yes",
      is_established: true,
      description: "Der Gutshof ist eine Farm",
      contact_name: "Bärbel Funke",
      contact_phone: "03391-12345678",
      type: "Farm",
      user_id: 4,
      updated_at: "2013-05-22T20:27:49Z",
      products: [
      "vegetables",
      "fruit",
      "eggs"
      ]
    },
    {
      id: 2,
      name: "Hof Blumberg",
      city: "Blumberg",
      address: "Friedensweg 11",
      latitude: "52.6068026",
      longitude: "13.6413405",
      accepts_new_members: "yes",
      is_established: true,
      description: "Der Hof Blumberg ist ein Familienbetrieb nordöstlich von Berlin.",
      contact_name: "Werner Funke",
      contact_phone: "033394-12345678",
      type: "Farm",
      user_id: 5,
      updated_at: "2013-05-22T20:27:50Z",
      products: [
      "vegetables",
      "fruit",
      "dairy",
      "meat"
      ]
    },
    {
      id: 3,
      name: "Fröhliche Gärtnerei",
      city: "Grünheide",
      address: "Kienbaumer Weg",
      latitude: "52.4268706",
      longitude: "13.8201102",
      accepts_new_members: "yes",
      is_established: true,
      description: "Unsere Gemüse-Versorger-Gemeinschaft startet am 1. März 2013 ihr zweites Wirtschaftsjahr und ist offen für neue ErnteanteilhaberInnen.",
      contact_name: "Johanna Zobbauer",
      contact_phone: "030-44400055",
      type: "Farm",
      user_id: 5,
      updated_at: "2013-05-22T20:27:50Z",
      products: [
      "vegetables",
      "fruit"
      ]
      }
    ]);
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
    placesController.collection = collection;
    placesController.showDetails(1);
    expect(placesController.detailsView).toBeInstanceOf(Teikei.Places.DetailsView);
  });

  it("should contain a DetailsMessageFormView when #showDetails is called.", function() {
    placesController.collection = collection;
    placesController.showDetails(1);
    expect(placesController.detailsView).toBeInstanceOf(Teikei.Places.DetailsMessageFormView);
  });


  describe("MapView", function(){

    it("should be initialized with a collection", function() {
      expect(placesController.mapView.collection).toBeInstanceOf(Teikei.Places.Collection);
    });

    it("should initialize a marker layer using model data.", function() {
      var model = collection.models[0];
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
        spyOn(placesController, "showEntryForm").andCallThrough();
        Teikei.vent.trigger("user:add:depot");
      });

      waitsFor(function() {
        var entryView = Teikei.placesEntryPopup.currentView;
        return entryView.isRevealed === true;
      }, 1000, "entryView to be opened");
    });

    it("should be rendered within the placesEntryPopup region when user:add:depot is triggered", function() {
      runs(function() {
        expect(Teikei.placesEntryPopup.currentView).toEqual(placesController.entryView);
      });
    });

    it("should be removed from the placesEntryPopup region when the containing modal is closed", function() {
      runs(function() {
        placesController.entryView.trigger("modal:close");
      });

      waitsFor(function() {
        return placesController.entryView.isClosed === true;
      }, 1000, "entryView to be closed");

      runs(function() {
        expect(Teikei.placesEntryPopup.currentView).toBeUndefined();
      });
    });

  });

  describe("EntryFarmView", function() {

    beforeEach(function() {
      spyOn(placesController, "showEntryForm").andCallThrough();
      Teikei.vent.trigger('user:add:farm');
    });

    it("should be initialized when user:add:farm is triggered", function() {
      expect(placesController.showEntryForm).toHaveBeenCalledWith(Teikei.Places.EntryFarmView);
      expect(placesController.entryView).toBeInstanceOf(Teikei.Places.EntryFarmView);
    });

  });

  describe("EntryDepotView", function(){

    beforeEach(function() {
      spyOn(placesController, "showEntryForm").andCallThrough();
      Teikei.vent.trigger('user:add:depot');
    });

    it("should be initialized when user:add:depot is triggered", function() {
      expect(placesController.showEntryForm).toHaveBeenCalledWith(Teikei.Places.EntryDepotView);
      expect(placesController.entryView).toBeInstanceOf(Teikei.Places.EntryDepotView);
    });

  });

});
