require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be a valid" do
    expect(@place).to be_valid
  end

  it "should require a name" do
    @place.name = ""
    expect(@place).not_to be_valid
  end

  it "should require a name within 5 to 30 characters" do
    short_name = "a" * 4
    @place.name = short_name
    expect(@place).not_to be_valid

    long_name = "a" * 31
    @place.name = long_name
    expect(@place).not_to be_valid
  end

  it "should require a city" do
    @place.city = ""
    expect(@place).not_to be_valid
  end

  it "should require a city within 2 to 40 characters" do
    short_city = "a" * 1
    @place.city = short_city
    expect(@place).not_to be_valid

    long_city = "a" * 41
    @place.city = long_city
    expect(@place).not_to be_valid
  end

  it "should require a address" do
    @place.address = ""
    expect(@place).not_to be_valid
  end

  it "should require a address within 6 to 40 characters" do
    short_address = "a" * 5
    @place.address = short_address
    expect(@place).not_to be_valid

    long_address = "a" * 41
    @place.address = long_address
    expect(@place).not_to be_valid
  end

  it "should require a user id" do
    @place.user_id = nil
    expect(@place).not_to be_valid
  end

  it "should require a the user id to be an integer" do
    @place.user_id = "abc"
    expect(@place).not_to be_valid

    @place.user_id = 23.1
    expect(@place).not_to be_valid
  end

  it "geocodes the location when being saved" do
    @place.latitude = nil
    @place.longitude = nil
    @place.save!

    expect(@place.latitude).not_to be_nil
    expect(@place.longitude).not_to be_nil
  end

  it "inserts a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm
    expect(@place.places).to include(farm)
  end

  it "removes a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm
    @place.places.delete(farm)
    expect(@place.places).to eql([])
  end

  it "replaces an existing relation entry" do
    farm = create(:farm)

    partner_farm = create(:farm, name: "Partnerfarm")
    farm.places = [partner_farm]
    farm.places =[]
    expect(farm.places).to eql([])
  end

  it "joins the fields address and city retrievable as location" do
    place = build(:place, address: "Fehrbelliner Str. 45a", city: "Neuruppin")
    expect(place.location).to eq("Fehrbelliner Str. 45a Neuruppin")
  end

  it "joins the fields address and city retrievable as location 2" do
    place = build(:place, address: nil, city: "Neuruppin")
    expect(place.location).to eq("Neuruppin")
  end

  it "joins the fields address and city retrievable as location 3" do
    place = build(:place, address: "Fehrbelliner Str. 45a", city: nil)
    expect(place.location).to eq("Fehrbelliner Str. 45a")
  end

  it "joins the fields address and city retrievable as location 4" do
    place = build(:place, address: nil, city: nil)
    expect(place.location).to eq(nil)
  end

end
