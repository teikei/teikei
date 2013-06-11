# spec/javascripts/foobar_spec.js.coffee
describe "foobar", ->
  it 'works', -> expect(1 + 1).toEqual(2);

describe "wanted failure", ->
  it 'fails', -> expect(1 + 1).toEqual(42);
