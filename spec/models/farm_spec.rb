require 'spec_helper'

describe Farm do
  before { @farm = build(:farm) }

  it "should be valid" do
    expect(@farm).to be_valid
  end


  it "rejects a founded_at value which is nil" do
    @farm.founded_at = nil
    expect(@farm).not_to be_valid
  end


  it "rejects a maximum_members value which is nil" do
    @farm.maximum_members = nil
    expect(@farm).not_to be_valid
  end

  it "accepts a maximum_members value of type integer" do
    @farm.maximum_members = 23
    expect(@farm).to be_valid
  end

  it "rejects a maximum_members value of type decimal" do
    @farm.maximum_members = 4.2
    expect(@farm).not_to be_valid
  end

  it "rejects a maximum_members value of type string" do
    @farm.maximum_members = "yes"
    expect(@farm).not_to be_valid
  end


  it "rejects a products value which is nil" do
    @farm.products = nil
    expect(@farm).not_to be_valid
  end

  it "rejects a farming_standard value which is nil" do
    @farm.farming_standard = nil
    expect(@farm).not_to be_valid
  end

  it "rejects a participation value which is nil" do
    @farm.participation = nil
    expect(@farm).not_to be_valid
  end

  it "rejects the boolean flag is_solawi_member which is nil" do
    @farm.is_solawi_member = nil
    expect(@farm).not_to be_valid
  end

  it "accepts the boolean flag is_solawi_member when true" do
    @farm.is_solawi_member = true
    expect(@farm).to be_valid
  end

  it "accepts the boolean flag is_solawi_member when false" do
    @farm.is_solawi_member = false
    expect(@farm).to be_valid
  end

  it "rejects nil as a value for accepts_new_members" do
    @farm.accepts_new_members = nil
    expect(@farm).not_to be_valid
  end

  it "rejects 'foobar' as a value for accepts_new_members" do
    @farm.accepts_new_members = "foobar"
    expect(@farm).not_to be_valid
  end

  it "rejects 123 as a value for accepts_new_members" do
    @farm.accepts_new_members = 123
    expect(@farm).not_to be_valid
  end

  it "accepts 'yes' as a value for accepts_new_members" do
    @farm.accepts_new_members = "yes"
    expect(@farm).to be_valid
  end

  it "accepts 'no' as a value for accepts_new_members" do
    @farm.accepts_new_members = "no"
    expect(@farm).to be_valid
  end

  it "accepts 'waitlist' as a value for accepts_new_members" do
    @farm.accepts_new_members = "waitlist"
    expect(@farm).to be_valid
  end

  it "geocodes the location when being saved" do
    @farm.latitude = nil
    @farm.longitude = nil
    @farm.save!

    expect(@farm.latitude).not_to be_nil
    expect(@farm.longitude).not_to be_nil
  end

  it "inserts a farm relation entry" do
    related_farm = build(:farm, name: "A related farm")
    @farm.places << related_farm
    expect(@farm.places).to include(related_farm)
  end

  it "inserts a depot relation entry" do
    related_depot = build(:depot, name: "A related depot")
    @farm.places << related_depot
    expect(@farm.places).to include(related_depot)
  end

  it "returns all aggregated places" do
    # (farm) --> (depot)
    #        --> (farm)
    own_depot = create(:depot, name: "Own depot")
    partner_farm = create(:farm, name: "Partner farm")
    foreign_depot = create(:depot, name: "Foreign depot")
    partner_farm.places << foreign_depot

    @farm.places << [own_depot, partner_farm]

    aggregated_places = @farm.aggregated_places
    expect(aggregated_places.size).to eq(2)
    expect(aggregated_places).to include(own_depot)
    expect(aggregated_places).to include(partner_farm)
    expect(aggregated_places).not_to include(foreign_depot)
  end

end
