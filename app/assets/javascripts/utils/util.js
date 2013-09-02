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



  // Returns the translation of the given string or an empty array.
  function translateString(englishString, lookupTable) {
    var translatedString = _.findWhere(lookupTable, { val: englishString });
    if (translatedString === undefined) {
      return englishString;
    }
    return translatedString.label;
  }

  // Returns the translation of the given array objects or an empty array.
  function translateArray(englishArray, lookupTable) {
    var translatedStrings = [];
    _.each(englishArray, function(item) {
      var translatedString = translateString(item, lookupTable);
      if (translatedString === undefined) {
        translatedStrings.push(item);
      }
      else {
        translatedStrings.push(translatedString);
      }
    });
    return translatedStrings;
  }

  // Returns the translation of the given object or an empty array.
  Util.translate = function(englishObject, lookupTable) {
    translatedItems = [];
    if (englishObject === undefined) {
      console.log("English object is undefined.");
      return translatedItems;
    }
    if (englishObject === null) {
      console.log("English object is null.");
      return translatedItems;
    }
    if (Teikei.Util.isArray(englishObject) && englishObject.length < 1) {
      console.log("English object is empty.");
      return translatedItems;
    }
    if (lookupTable === undefined) {
      console.log("Lookup table is undefined.");
      return translatedItems;
    }
    if (lookupTable === null) {
      console.log("Lookup table is null.");
      return translatedItems;
    }
    if (Teikei.Util.isArray(lookupTable) && lookupTable.length < 1) {
      console.log("Lookup table is empty.");
      return translatedItems;
    }
    if (Teikei.Util.isArray(englishObject) && Teikei.Util.isArray(lookupTable)) {
      return translateArray(englishObject, lookupTable);
    }
    if (Teikei.Util.isString(englishObject) && Teikei.Util.isArray(lookupTable)) {
      return translateString(englishObject, lookupTable);
    }
    console.log("English object is of type " + Teikei.Util.typeOf(englishArray));
    console.log("Lookup table is of type " + Teikei.Util.typeOf(lookupTable));
    return translatedItems;
  };

});
