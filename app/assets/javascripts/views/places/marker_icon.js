Teikei.module("Places.MarkerIcon", function(MarkerIcon, App, Backbone, Marionette, $, _) {

  MarkerIcon.Base = L.Icon.extend({
    options: {
      shadowUrl: '/assets/marker-shadow.png',
      iconSize:     [47, 57],
      iconAnchor:   [23, 58],
      shadowSize:   [64, 68],
      popupAnchor:  [0, -30]
    }
  });

  MarkerIcon.Farm = MarkerIcon.Base.extend({
    options: {
      iconUrl: '/assets/marker-farm.png'
    }
  });

  MarkerIcon.Depot = MarkerIcon.Base.extend({
    options: {
      iconUrl: '/assets/marker-depot.png'
    }
  });

});
