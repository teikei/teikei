Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.AreaSelectView = Teikei.Base.ItemView.extend({

    tagName: "form",

    template: "places/area_select",

    ui: {
      select: "#area-select"
    },

    events: {
      "change #area-select": "selectArea"
    },

    selectArea: function(event) {
      var areaName = this.parseAreaName(event);
      this.trigger("select:area", areaName);
    },

    setOption: function(optionValue) {
      this.ui.select.val(optionValue);
    },

    parseAreaName: function(event) {
      var options = event.currentTarget.options;
      var index = options.selectedIndex;
      return options.item(index).value;
    }

  });
});
