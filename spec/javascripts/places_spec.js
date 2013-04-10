describe("Places", function() {

  var placesController;
  var collection;

  beforeEach(function () {
    placesController = new Teikei.Places.Controller();

    collection = new Teikei.Places.Collection([
      {
      latitude: 52.5545558,
      longitude: 13.4017189,
        type: "Farm"
      },
      {
      latitude: 52.5545678,
      longitude: 13.4013456,
        type: "Depot"
      },
      {
      latitude: 52.5545556,
      longitude: 13.4018654,
        type: "Depot"
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

});
