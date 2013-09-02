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


});
