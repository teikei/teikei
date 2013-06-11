Teikei.module('PlaceMessage', function(PlaceMessage, App, Backbone, Marionette, $, _) {

  PlaceMessage.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/send_message"

  });

});
