describe("Util", function() {

  it("returns the type of a String", function() {
    var str = "This is a string.";
    expect(Teikei.Util.typeOf(str)).toEqual("[object String]");
  });

  it("returns the type of an Array", function() {
    var arr = ["one", "two", "three"];
    expect(Teikei.Util.typeOf(arr)).toEqual("[object Array]");
  });

  it("returns true for a String", function() {
    var str = "This is a string.";
    expect(Teikei.Util.isString(str)).toEqual(true);
  });

  it("returns false for an Array", function() {
    var arr = ["one", "two", "three"];
    expect(Teikei.Util.isString(arr)).toEqual(false);
  });

  it("returns true for an Array", function() {
    var arr = ["one", "two", "three"];
    expect(Teikei.Util.isArray(arr)).toEqual(true);
  });

  it("returns false for a String", function() {
    var str = "This is a string.";
    expect(Teikei.Util.isArray(str)).toEqual(false);
  });


  var lookupTable = [
    { label: "Eins", val: "One" },
    { label: "Zwei", val: "Two" },
    { label: "Drei", val: "Three" }
  ];

  it("returns an empty string when an empty string is provided", function() {
    var englishTerm = "";
    var germanTerm = "";
    expect(Teikei.Util.translate(englishTerm, lookupTable)).toEqual(germanTerm);
  });

  it("returns an empty array when an empty array is provided", function() {
    var englishTerms = [];
    var germanTerms = [];
    expect(Teikei.Util.translate(englishTerms, lookupTable)).toEqual(germanTerms);
  });

  it("translates a single term", function() {
    var englishTerm = "Two";
    var germanTerm = "Zwei";
    expect(Teikei.Util.translate(englishTerm, lookupTable)).toEqual(germanTerm);
  });

  it("returns the English term if the German translation is missing", function() {
    var englishTerm = "Four";
    expect(Teikei.Util.translate(englishTerm, lookupTable)).toEqual(englishTerm);
  });

  it("translates an array of terms", function() {
    var englishTerms = [ "Three", "One", "Two" ];
    var germanTerms = [ "Drei", "Eins", "Zwei" ];
    expect(Teikei.Util.translate(englishTerms, lookupTable)).toEqual(germanTerms);
  });

  it("returns the English terms if the German translation is missing", function() {
    var englishTerms = [ "Four", "Five", "Six" ];
    expect(Teikei.Util.translate(englishTerms, lookupTable)).toEqual(englishTerms);
  });

  it("returns the English terms where the German translation is missing", function() {
    var englishTerms = [ "Two", "Five", "Three" ];
    var mixedTerms = [ "Zwei", "Five", "Drei" ];
    expect(Teikei.Util.translate(englishTerms, lookupTable)).toEqual(mixedTerms);
  });

  it("translates each vegetable product present in lookup table", function() {
    var englishTerms = [ "fruits", "mushrooms", "cereals", "meat" ];
    var germanTerms = [ "Obst", "Pilze", "Getreideprodukte", "meat" ];
    expect(Teikei.Util.translateVegetableProducts(englishTerms)).toEqual(germanTerms);
  });

  it("translates each animal product present in lookup table", function() {
    var englishTerms = [ "honey", "fish", "eggs", "vegetables" ];
    var germanTerms = [ "Honig", "Fisch", "Eier", "vegetables" ];
    expect(Teikei.Util.translateAnimalProducts(englishTerms)).toEqual(germanTerms);
  });

  it("translates each beverage present in lookup table", function() {
    var englishTerms = [ "juice", "wine", "beer", "bread" ];
    var germanTerms = [ "Saft", "Wein", "Bier", "bread" ];
    expect(Teikei.Util.translateBeverages(englishTerms)).toEqual(germanTerms);
  });

  it("translates each product present in lookup table", function() {
    var englishVegetableProducts = [ "fruits", "mushrooms", "cereals", "meat" ];
    var englishAnimalProducts = [ "honey", "fish", "eggs", "vegetables" ];
    var englishBeverages = [ "juice", "wine", "beer", "bread" ];
    var germanTerms = [
      "Obst", "Pilze", "Getreideprodukte", "meat",
      "Honig", "Fisch", "Eier", "vegetables",
      "Saft", "Wein", "Bier", "bread"
    ];
    expect(Teikei.Util.translateProducts(
      englishVegetableProducts,
      englishAnimalProducts,
      englishBeverages)
    ).toEqual(germanTerms);
  });

  it("capitalizes the first letter of a word", function() {
    var originalTerm = "word";
    var expectedTerm = "Word";
    expect(Teikei.Util.capitalizeFirstLetter(originalTerm)).toEqual(expectedTerm);
  });

  it("compiles a message from multiple errors", function() {
    var errors = {
      latitude: [ "ist keine Zahl", "muss ausgefüllt werden" ],
      longitude: ["ist keine Zahl" , "muss ausgefüllt werden" ]
    };
    var message = "Latitude ist keine Zahl, Latitude muss ausgefüllt werden, " +
                  "Longitude ist keine Zahl, Longitude muss ausgefüllt werden";
    expect(Teikei.Util.compileErrorMessage(errors)).toEqual(message);
  });

  it("returns undefined if errors is undefined", function() {
    expect(Teikei.Util.compileErrorMessage(undefined)).toEqual(undefined);
  });

  it("returns undefined if errors is not an array", function() {
    expect(Teikei.Util.compileErrorMessage("a string")).toEqual(undefined);
  });

});
