require 'spec_helper'

describe Depot do
  before { @depot = build(:depot) }

  it "should be a valid" do
    expect(@depot).to be_valid
  end

  it "geocodes the location when being saved" do
    @depot.save!
    expect(@depot.latitude).not_to be_nil
    expect(@depot.longitude).not_to be_nil
  end

  it "insert a depot relation entry" do
    related_depot = build(:depot, name: "A related depot")
    @depot.places << related_depot.place
    expect(@depot.places).to include(related_depot.place)
  end

  it "inserts a farm relation entry" do
    related_farm = build(:farm, name: "A related farm")
    @depot.places << related_farm.place
    expect(@depot.places).to include(related_farm.place)
  end

  it "return all aggregated places" do
    # (depot) --> (farm) --> (depot)
    #                    --> (farm)
    own_farm = create(:farm, name: "Own farm")
    own_farm_depot = create(:depot, name: "Depot of own farm")
    own_farm_partner_farm = create(:farm, name: "Partner farm of own farm")
    own_farm.places << [own_farm_depot.place, own_farm_partner_farm.place]

    @depot.places << own_farm.place

    aggregated_places = @depot.aggregated_places
    expect(aggregated_places.size).to eq(3)
    expect(aggregated_places).to include(own_farm.place)
    expect(aggregated_places).to include(own_farm_depot.place)
    expect(aggregated_places).to include(own_farm_partner_farm.place)
  end
end
