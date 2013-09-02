Teikei.module("Util", function(Util, App, Backbone, Marionette, $, _) {

  // Returns the type of the given object.
  Util.typeOf = function(object) {
    return Object.prototype.toString.call(object);
  };

  // Returns true if the given object is of type Array; otherwise false.
  Util.isArray = function(object) {
    return (this.typeOf(object) === '[object Array]');
  };

  // Returns true if the given object is of type String; otherwise false.
  Util.isString = function(object) {
    return (this.typeOf(object) === '[object String]');
  };

});
