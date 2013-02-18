require 'spec_helper'

describe Farm do
  before { @farm = build(:farm) }

  it "should be a valid" do
    expect(@farm).to be_valid
  end

  it "geocodes the location when being saved" do
    @farm.save!

    expect(@farm.latitude).not_to be_nil
    expect(@farm.longitude).not_to be_nil
  end

  it "inserts a farm relation entry" do
    related_farm = build(:farm, name: "A related farm")
    @farm.places << related_farm.place
    expect(@farm.places).to include(related_farm.place)
  end

  it "inserts a depot relation entry" do
    related_depot = build(:depot, name: "A related depot")
    @farm.places << related_depot.place
    expect(@farm.places).to include(related_depot.place)
  end

  it "returns all aggregated places" do
    own_depot = create(:depot, name: "Own depot")
    partner_farm = create(:farm, name: "Partner farm")
    foreign_depot = create(:depot, name: "Foreign depot")

    @farm.places << own_depot.place
    @farm.places << partner_farm.place
    partner_farm.places << foreign_depot.place

    aggregated_places = @farm.aggregated_places
    expect(aggregated_places).to include(own_depot.place)
    expect(aggregated_places).to include(partner_farm.place)
    expect(aggregated_places).to include(foreign_depot.place)
  end

end
