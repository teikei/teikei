MarkerIcon = {};

MarkerIcon.Base = L.Icon.extend({
  options: {
    shadowUrl: '/assets/marker-shadow.png',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    shadowSize: [50, 60],
    popupAnchor: [0, 0]
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

Places.MarkerIcon = MarkerIcon;
