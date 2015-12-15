PlacesList = {};

require('./views/placeslist');

PlacesList.Controller = {
  showEntryList() {
    const currentUser = Teikei.currentUser;
    let filteredCollection;
    if (currentUser) {
      filteredCollection = Places.collection.byUserId(currentUser.get('id'));
      filteredCollection.comparator = function(model) {
        return [model.get('type'), model.get('name')];
      };
      filteredCollection.sort();
    }
    const entryListView = new PlacesList.EntryListView({
      collection: filteredCollection
    });
    Teikei.modalRegion.show(entryListView);
  }
};

Teikei.vent.on(
  'user:show:entrylist',
  PlacesList.Controller.showEntryList,
  PlacesList.Controller
);
