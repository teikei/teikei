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


});
