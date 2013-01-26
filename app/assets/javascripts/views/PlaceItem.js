Teikei.module('Views', function(Views, App, Backbone, Marionette, $, _) {

  Views.PlaceItem = Marionette.ItemView.extend({

    tagName: 'li',
    template: 'PlaceItem'

  });

});
