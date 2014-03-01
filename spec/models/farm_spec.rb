require 'spec_helper'

describe Farm do
  let(:farm) { create(:farm) }

  it "should be valid" do
    expect(farm).to be_valid
  end

  it "has a single ownership" do
    expect(farm.ownerships.length).to eq(1)
  end

  it "has a single ownership" do
    farm.users << create(:admin)
    expect(farm.ownerships.length).to eq(2)
  end

  it "rejects a founded_at_year value which is less than 0" do
    farm.founded_at_year = -5
    expect(farm).not_to be_valid
  end

  it "rejects a founded_at_year value which is not of type integer" do
    farm.founded_at_year = "Anno domini"
    expect(farm).not_to be_valid
  end

  it "accepts a founded_at_year value of type integer" do
    farm.founded_at_year = 2012
    expect(farm).to be_valid
  end

  it "accepts a founded_at_month value which is nil" do
    farm.founded_at_month = nil
    expect(farm).to be_valid
  end

  it "rejects a founded_at_month value which is less than 1" do
    farm.founded_at_month = -5
    expect(farm).not_to be_valid
  end

  it "rejects a founded_at_month value which is greater than 12" do
    farm.founded_at_month = 13
    expect(farm).not_to be_valid
  end

  it "rejects a founded_at_month value which is not of type integer" do
    farm.founded_at_month = "Mai"
    expect(farm).not_to be_valid
  end

  it "accepts a founded_at_month value of type integer" do
    farm.founded_at_month = 5
    expect(farm).to be_valid
  end

  it "accepts a maximum_members value of type integer" do
    farm.maximum_members = 23
    expect(farm).to be_valid
  end

  it "rejects a maximum_members value of type decimal" do
    farm.maximum_members = 4.2
    expect(farm).not_to be_valid
  end

  it "rejects a maximum_members value of type string" do
    farm.maximum_members = "yes"
    expect(farm).not_to be_valid
  end

  it "rejects a maximum_members value smaller then 0" do
    farm.maximum_members = -1
    expect(farm).not_to be_valid
  end

  it "rejects a maximum_members value larger then 500" do
    farm.maximum_members = 501
    expect(farm).not_to be_valid
  end

  it "accepts an empty contact function" do
    farm.contact_function = ""
    expect(farm).to be_valid
  end

  it "rejects a contact function longer then 100 characters" do
    long_contact_function = "a" * 101
    farm.contact_function = long_contact_function
    expect(farm).not_to be_valid
  end

  it "rejects a description longer than 1000 characters" do
    farm.description = "a" * 1001
    expect(farm).not_to be_valid
  end

  it "rejects vegetable_products that are not part of the enumeration" do
    farm.vegetable_products = ["cheeseburgers", "candy"]
    expect(farm).not_to be_valid
  end

  it "rejects animal_products that are not part of the enumeration" do
    farm.animal_products = ["cheeseburgers", "candy"]
    expect(farm).not_to be_valid
  end

  it "rejects beverages that are not part of the enumeration" do
    farm.beverages = ["cheeseburgers", "candy"]
    expect(farm).not_to be_valid
  end

  it "rejects a additional_product_information longer then 1000 characters" do
    long_additional_product_information = "a" * 1001
    farm.additional_product_information = long_additional_product_information
    expect(farm).not_to be_valid
  end

  it "rejects the boolean flag acts_ecological which is nil" do
    farm.acts_ecological = nil
    expect(farm).not_to be_valid
  end

  it "accepts the boolean flag acts_ecological when true" do
    farm.acts_ecological = true
    expect(farm).to be_valid
  end

  it "accepts the boolean flag acts_ecological when false" do
    farm.acts_ecological = false
    expect(farm).to be_valid
  end

  it "rejects an economical_behavior longer than 1000 characters" do
    long_economical_behavior = "a" * 1001
    farm.economical_behavior = long_economical_behavior
    expect(farm).not_to be_valid
  end

  it "rejects a participation longer than 1000 characters" do
    long_participation = "a" * 1001
    farm.participation = long_participation
    expect(farm).not_to be_valid
  end

  it "rejects nil as a value for accepts_new_members" do
    farm.accepts_new_members = nil
    expect(farm).not_to be_valid
  end

  it "rejects 'foobar' as a value for accepts_new_members" do
    farm.accepts_new_members = "foobar"
    expect(farm).not_to be_valid
  end

  it "rejects 123 as a value for accepts_new_members" do
    farm.accepts_new_members = 123
    expect(farm).not_to be_valid
  end

  it "accepts 'yes' as a value for accepts_new_members" do
    farm.accepts_new_members = "yes"
    expect(farm).to be_valid
  end

  it "accepts 'no' as a value for accepts_new_members" do
    farm.accepts_new_members = "no"
    expect(farm).to be_valid
  end

  it "accepts 'waitlist' as a value for accepts_new_members" do
    farm.accepts_new_members = "waitlist"
    expect(farm).to be_valid
  end

  it "rejects invalid contact urls" do
    farm.url = "wwww.foo.bar.baz//|%"
    expect(farm).not_to be_valid

    farm.url = "file://foo.txt"
    expect(farm).not_to be_valid
  end

  it "adds a protocol to the url if it is missing" do
    farm.url = "www.example.com"
    expect(farm).to be_valid
    expect(farm.url).to eq("http://www.example.com")

    farm.url = "example.com"
    expect(farm).to be_valid
    expect(farm.url).to eq("http://example.com")

    farm.url = "subdomain.foobar.com"
    expect(farm).to be_valid
    expect(farm.url).to eq("http://subdomain.foobar.com")
  end

  it "accepts valid contact urls" do

    farm.url = "http://example.com"
    expect(farm).to be_valid

    farm.url = "https://highsecurityplace.com"
    expect(farm).to be_valid
  end

  it "inserts a farm relation entry" do
    related_farm = build(:farm, name: "A related farm")
    farm.places << related_farm
    expect(farm.places).to include(related_farm)
  end

  it "inserts a depot relation entry" do
    related_depot = build(:depot, name: "A related depot")
    farm.places << related_depot
    expect(farm.places).to include(related_depot)
  end

  it "returns all aggregated places" do
    # (farm) --> (depot)
    #        --> (farm)
    own_depot = create(:depot, name: "Own depot")
    partner_farm = create(:farm, name: "Partner farm")
    foreign_depot = create(:depot, name: "Foreign depot")
    partner_farm.places << foreign_depot
    partner_farm.save!

    farm.places << [own_depot, partner_farm]
    farm.save!

    aggregated_places = farm.aggregated_places
    expect(aggregated_places.size).to eq(2)
    expect(aggregated_places).to include(own_depot)
    expect(aggregated_places).to include(partner_farm)
    expect(aggregated_places).not_to include(foreign_depot)
  end

end
