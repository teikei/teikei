Teikei.module("PlacesList", function(PlacesList, Teikei, Backbone, Marionette, $, _) {

  PlacesList.Controller = Backbone.Marionette.Controller.extend( {

    showEntryList: function() {
      var currentUser = Teikei.currentUser;
      var filteredCollection;
      if (currentUser) {
        filteredCollection = this.collection.byUser(currentUser.get('id'));
        filteredCollection.comparator = function(model) {
          return [model.get("type"), model.get("name")];
        }
        filteredCollection.sort();
      }
      this.entryListView = new Teikei.PlacesList.EntryListView({
        collection: filteredCollection
      });
      Teikei.modalRegion.show(this.entryListView);
    },


  });
});
