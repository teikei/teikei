Teikei.module("PlacesList", function(PlacesList, Teikei, Backbone, Marionette, $, _) {

  PlacesList.EntryListView = Marionette.CompositeView.extend({
    ui: {
      newEntryMenuItem: "#new-entry-my-entries",
      newEntryDropdown: "#new-entry-my-entries .dropdown",
    },

    events: {
      "click #new-entry-my-entries": "openNewEntryDropdown",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot"
    },

    openNewEntryDropdown: function() {
      var dropdown = this.ui.newEntryDropdown;
      dropdown.show();
      _.defer( function() {
        $("body").one("click", function() {
          dropdown.hide();
        });
      });
    },

    addFarm: function(event) {
      event.preventDefault();
      Teikei.vent.trigger("user:add:farm");
    },

    addDepot: function(event) {
      event.preventDefault();
      Teikei.vent.trigger("user:add:depot");
    },

    className: "reveal-modal large",
    template: "places/list/entryList",

    itemViewContainer: "#entrylist",
    itemView: PlacesList.EntryListItemView,
    emptyView: PlacesList.EntryListEmptyView,

    initialize: function(options) {
      this.collection = options.collection;
    }
  });

});
