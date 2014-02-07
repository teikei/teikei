Teikei.module('Entities', function(Entities, App, Backbone, Marionette, $, _) {

  Entities.PlaceMessage = Backbone.Model.extend({

    urlRoot: "/api/v1/send_message"

  });

});
