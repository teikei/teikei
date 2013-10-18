require 'spec_helper'

describe Farm do
  before { @farm = build(:farm) }

  it "should be valid" do
    expect(@farm).to be_valid
  end

  it "rejects a founded_at_year value which is nil" do
    @farm.founded_at_year = nil
    expect(@farm).not_to be_valid
  end

  it "rejects a founded_at_year value which is less than 0" do
    @farm.founded_at_year = -5
    expect(@farm).not_to be_valid
  end

  it "rejects a founded_at_year value which is not of type integer" do
    @farm.founded_at_year = "Anno domini"
    expect(@farm).not_to be_valid
  end

  it "accepts a founded_at_year value of type integer" do
    @farm.founded_at_year = 2012
    expect(@farm).to be_valid
  end

  it "accepts a founded_at_month value which is nil" do
    @farm.founded_at_month = nil
    expect(@farm).to be_valid
  end

  it "rejects a founded_at_month value which is less than 1" do
    @farm.founded_at_month = -5
    expect(@farm).not_to be_valid
  end

  it "rejects a founded_at_month value which is greater than 12" do
    @farm.founded_at_month = 13
    expect(@farm).not_to be_valid
  end

  it "rejects a founded_at_month value which is not of type integer" do
    @farm.founded_at_month = "Mai"
    expect(@farm).not_to be_valid
  end

  it "accepts a founded_at_month value of type integer" do
    @farm.founded_at_month = 5
    expect(@farm).to be_valid
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

  it "accepts an empty contact function" do
    @farm.contact_function = ""
    expect(@farm).to be_valid
  end

  it "rejects a contact_function longer then 60 characters" do
    long_contact_function = "a" * 61
    @farm.contact_function = long_contact_function
    expect(@farm).not_to be_valid
  end

  it "rejects a products value which is nil" do
    @farm.products = nil
    expect(@farm).not_to be_valid
  end

  it "rejects products that are not part of the enumeration" do
    @farm.products = ["cheeseburgers", "candy"]
    expect(@farm).not_to be_valid
  end

  it "rejects a participation value which is nil" do
    @farm.participation = nil
    expect(@farm).not_to be_valid
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

  it "rejects invalid contact urls" do
    @farm.contact_url = "foobar"
    expect(@farm).not_to be_valid

    @farm.contact_url = "wwww.foo.bar.baz//"
    expect(@farm).not_to be_valid

    @farm.contact_url = "file://foo.txt"
    expect(@farm).not_to be_valid

    # http://, https:// is required

    @farm.contact_url = "www.example.com"
    expect(@farm).not_to be_valid

    @farm.contact_url = "example.com"
    expect(@farm).not_to be_valid
  end

  it "accepts valid contact urls" do
    @farm.contact_url = "http://example.com"
    expect(@farm).to be_valid

    @farm.contact_url = "https://highsecurityfarm.com"
    expect(@farm).to be_valid

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
    partner_farm.save!

    @farm.places << [own_depot, partner_farm]
    @farm.save!

    aggregated_places = @farm.aggregated_places
    expect(aggregated_places.size).to eq(2)
    expect(aggregated_places).to include(own_depot)
    expect(aggregated_places).to include(partner_farm)
    expect(aggregated_places).not_to include(foreign_depot)
  end

end
