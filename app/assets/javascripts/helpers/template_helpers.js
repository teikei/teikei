Teikei.templateHelpers = (function(){

  // Returns the translation of the given object or an empty array.
  function translate(englishObject, lookupTable) {
    translatedItems = [];
    if (englishObject === undefined) {
      console.log("English object is undefined.");
      return translatedItems;
    }
    if (englishObject === null) {
      console.log("English object is null.");
      return translatedItems;
    }
    if (isArray(englishObject) && englishObject.length < 1) {
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
    if (isArray(lookupTable) && lookupTable.length < 1) {
      console.log("Lookup table is empty.");
      return translatedItems;
    }
    if (isArray(englishObject) && isArray(lookupTable)) {
      return translateArray(englishObject, lookupTable);
    }
    if (isString(englishObject) && isArray(lookupTable)) {
      return translateString(englishObject, lookupTable);
    }
    console.log("English object is of type " + typeOf(englishArray));
    console.log("Lookup table is of type " + typeOf(lookupTable));
    return translatedItems;
  }

  // Returns the translation of the given string or an empty array.
  function translateString(englishString, lookupTable) {
    translatedString = _.findWhere(lookupTable, { val: englishString });
    if (translateString === undefined) {
      return [];
    }
    return translatedString;
  }

  // Returns the translation of the given array objects or an empty array.
  function translateArray(englishArray, lookupTable) {
    translatedStrings = [];
    _.each(englishArray, function(item) {
      translatedString = translateString(item, lookupTable);
      if (translatedString !== undefined) {
        translatedStrings.push(translatedString.label);
      }
    });
    return translatedStrings;
  }

  // Returns true if the given object is of type Array; otherwise false.
  function isArray(object) {
    return (typeOf(object) === '[object Array]');
  }

  // Returns true if the given object is of type String; otherwise false.
  function isString(object) {
    return (typeOf(object) === '[object String]');
  }

  // Returns the type of the given object.
  function typeOf(object) {
    return Object.prototype.toString.call(object);
  }

  return {
    translate: translate
  };

})();
