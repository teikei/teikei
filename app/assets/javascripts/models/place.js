Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Map Model
  // ----------

  Places.Model = Backbone.Model.extend({
    urlRoot: function(){
      var type = this.get("type").toLowerCase();
      var query = "/api/v1/{type}s/";
      return query.replace("{type}", type);
    }
  });

});
