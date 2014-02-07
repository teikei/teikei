Teikei.module('Entities', function(Entities, App, Backbone, Marionette, $, _) {

  PlaceMessage.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/send_message"

  });

});
