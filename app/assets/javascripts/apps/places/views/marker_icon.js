Teikei.module("Places.MarkerIcon", function(MarkerIcon, Teikei, Backbone, Marionette, $, _) {

  MarkerIcon.Base = L.Icon.extend({
    options: {
      shadowUrl: '/assets/marker-shadow.png',
      iconSize:     [40, 50],
      iconAnchor:   [20, 55],
      shadowSize:   [50, 60],
      popupAnchor:  [0, -20]
    }
  });

  MarkerIcon.Farm = MarkerIcon.Base.extend({
    options: {
      iconUrl: '/assets/marker-farm.svg'
    }
  });

  MarkerIcon.Depot = MarkerIcon.Base.extend({
    options: {
      iconUrl: '/assets/marker-depot.svg'
    }
  });

});
