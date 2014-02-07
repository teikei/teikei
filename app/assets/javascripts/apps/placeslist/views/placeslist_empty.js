Teikei.module("PlacesList", function(PlacesList, Teikei, Backbone, Marionette, $, _) {

  PlacesList.EntryListEmptyView = Marionette.ItemView.extend({
    template: "places/list/entryListEmptyView"
  });

});
