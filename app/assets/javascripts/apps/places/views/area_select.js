Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.AreaSelectView = Teikei.Base.ItemView.extend({

    tagName: "form",

    template: "places/area_select",

    ui: {
      areaSelect: "#area-select"
    },

    events: {
      "change #area-select": "selectArea"
    },

    initialize: function(options) {
      this.areas = options.areas;
    },

    onRender: function() {
      this.initializeSelectHtml();
    },

    selectArea: function(event) {
      var areaName = this.parseAreaName(event);
      this.trigger("select:area", areaName);
    },

    setOption: function(optionValue) {
      this.ui.areaSelect.val(optionValue);
    },

    initializeSelectHtml: function() {
      var optionsHtml = _.map(this.areas, this.getOptionHtml);
      this.ui.areaSelect.html(optionsHtml);
    },

    getOptionHtml: function(area, key) {
      return $('<option/>', {
        value: key,
        text: area.displayName
      });
    },

    parseAreaName: function(event) {
      var options = event.currentTarget.options;
      var index = options.selectedIndex;
      return options.item(index).value;
    }

  });
});
