require 'rails_helper'

describe Depot, type: :model do
  let(:depot) { create(:depot) }

  it 'should be a valid' do
    expect(depot).to be_valid
  end

  it 'has a single ownership' do
    expect(depot.ownerships.length).to eq(1)
  end

  it 'has multiple ownerships' do
    depot.users << create(:admin)
    expect(depot.ownerships.length).to eq(2)
  end

  it 'insert a depot relation entry' do
    related_depot = build(:depot, name: 'A related depot')
    depot.places << related_depot
    expect(depot.places).to include(related_depot)
  end

  it 'inserts a farm relation entry' do
    related_farm = build(:farm, name: 'A related farm')
    depot.places << related_farm
    expect(depot.places).to include(related_farm)
  end

  it 'return all aggregated places' do
    # (depot) --> (farm) --> (depot)
    #                    --> (farm)
    own_farm = create(:farm, name: 'Own farm')
    own_farm_depot = create(:depot, name: 'Depot of own farm')
    own_farm_partner_farm = create(:farm, name: 'Partner farm of own farm')
    own_farm.places << [own_farm_depot, own_farm_partner_farm]
    own_farm.save!

    depot.places << own_farm
    depot.save!

    aggregated_places = depot.aggregated_places
    expect(aggregated_places.size).to eq(3)
    expect(aggregated_places).to include(own_farm)
    expect(aggregated_places).to include(own_farm_depot)
    expect(aggregated_places).to include(own_farm_partner_farm)
  end
end
