require('fileupload');
require('timeago');
///= require jquery-timeago/locales/jquery.timeago.de
require('spin');
require('leaflet');
require('leaflet.markercluster');
require('select2');
///= require select2/select2_locale_de
Backbone = require('backbone');
Marionette = require('backbone.marionette');
Backbone.Marionette = Marionette;
require('backbone-forms');

require('./lib/backbone.forms.select2');

require('./teikei');

Entities = {};
require('./entities/geocoder');
require('./entities/place');
require('./entities/place_message');
require('./entities/places');
require('./entities/user_session');
require('./entities/user_signup');

require('./forms/fileupload');
require('./forms/form_validators');
require('./forms/geocoder');
require('./forms/yes_no_checkbox');

Base = {};
require('./base/alert_region');
require('./base/base_item_view');
require('./base/modal_region');

require('./apps/alert/alert_app');
require('./utils/alert');

require('./apps/places/places_app');
require('./apps/placeslist/placeslist_app');
require('./apps/user/user_app');
