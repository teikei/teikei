Teikei.module("PlacesList", function(PlacesList, Teikei, Backbone, Marionette, $, _) {
  PlacesList.Controller = {
    showEntryList: function() {
      var currentUser = Teikei.currentUser;
      var filteredCollection;
      if (currentUser) {
        filteredCollection = Teikei.Places.collection.byUserId(currentUser.get('id'));
        filteredCollection.comparator = function(model) {
          return [model.get("type"), model.get("name")];
        };
        filteredCollection.sort();
      }
      var entryListView = new Teikei.PlacesList.EntryListView({
        collection: filteredCollection
      });
      Teikei.modalRegion.show(entryListView);
    }
  };

  Teikei.vent.on("user:show:entrylist", PlacesList.Controller.showEntryList, PlacesList.Controller);
});
