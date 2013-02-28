require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be a valid" do
    expect(@place).to be_valid
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
