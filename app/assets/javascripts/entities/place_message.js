Teikei.module('Entities', function(Entities, Teikei, Backbone, Marionette, $, _) {

  Entities.PlaceMessage = Backbone.Model.extend({

    urlRoot: "/api/v1/send_message"

  });

});
