require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be a valid" do
    expect(@place).to be_valid
  end

  it "geocodes the location when being saved" do
    @place.save!

    expect(@place.latitude).not_to be_nil
    expect(@place.longitude).not_to be_nil
  end

  it "inserts a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm.place
    expect(@place.places).to include(farm.place)
  end

  it "removes a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm.place
    @place.places.delete(farm.place)
    expect(@place.places).to eql([])
  end
end
