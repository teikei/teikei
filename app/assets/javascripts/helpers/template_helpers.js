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
  }

  // Returns the translation of the given string or an empty array.
  function translateString(englishString, lookupTable) {
    var translatedString = _.findWhere(lookupTable, { val: englishString });
    if (translateString === undefined) {
      return [];
    }
    return translatedString;
  }

  // Returns the translation of the given array objects or an empty array.
  function translateArray(englishArray, lookupTable) {
    var translatedStrings = [];
    _.each(englishArray, function(item) {
      var translatedString = translateString(item, lookupTable);
      if (translatedString !== undefined) {
        translatedStrings.push(translatedString.label);
      }
    });
    return translatedStrings;
  }

  return {
    translate: translate
  };

})();
