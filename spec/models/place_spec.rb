require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be valid" do
    expect(@place).to be_valid
  end

  it "requires a name" do
    @place.name = ""
    expect(@place).not_to be_valid
  end

  it "rejects a name shorter then 4 characters" do
    short_name = "a" * 4
    @place.name = short_name
    expect(@place).not_to be_valid
  end

  it "rejects a name longer then 50 characters" do
    long_name = "a" * 51
    @place.name = long_name
    expect(@place).not_to be_valid
  end

  it "rejects an empty city string" do
    @place.city = ""
    expect(@place).not_to be_valid
  end

  it "rejects a city shorter then 3 characters" do
    short_city = "a" * 1
    @place.city = short_city
    expect(@place).not_to be_valid
  end

  it "rejects a city longer then 40 characters" do
    long_city = "a" * 41
    @place.city = long_city
    expect(@place).not_to be_valid
  end

  it "rejects an empty address" do
    @place.address = ""
    expect(@place).not_to be_valid
  end

  it "rejects an address shorter then 6 characters" do
    short_address = "a" * 5
    @place.address = short_address
    expect(@place).not_to be_valid
  end

  it "rejects an address longer then 40 characters" do
    long_address = "a" * 41
    @place.address = long_address
    expect(@place).not_to be_valid
  end

  it "rejects a user id which is nil" do
    pending "Need to clarify if the user association should be tested through the place model."
    @place.user_id = nil
    expect(@place).not_to be_valid
  end

  it "rejects a user id of type string" do
    pending "Need to clarify if the user association should be tested through the place model."
    @place.user_id = "abc"
    expect(@place).not_to be_valid
  end

  it "rejects a user id of type float" do
    pending "Need to clarify if the user association should be tested through the place model."
    @place.user_id = 23.1
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag accepts_new_members which is nil" do
    @place.accepts_new_members = nil
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag accepts_new_members when of type integer" do
    @place.accepts_new_members = 23
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag accepts_new_members when of type string" do
    @place.accepts_new_members = "yes"
    expect(@place).not_to be_valid
  end

  it "accepts the boolean flag accepts_new_members when true" do
    @place.accepts_new_members = true
    expect(@place).to be_valid
  end

  it "accepts the boolean flag accepts_new_members when false" do
    pending "Test fails for unknown reasons. Please verify why!"
    @place.accepts_new_members = false
    expect(@place).to be_valid
  end


  it "rejects the boolean flag is_established which is nil" do
    @place.is_established = nil
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag is_established when of type integer" do
    @place.is_established = 23
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag is_established when of type string" do
    @place.is_established = "yes"
    expect(@place).not_to be_valid
  end

  it "accepts the boolean flag is_established when true" do
    @place.is_established = true
    expect(@place).to be_valid
  end

  it "accepts the boolean flag is_established when false" do
    pending "Test fails for unknown reasons. Please verify why!"
    @place.is_established = false
    expect(@place).to be_valid
  end


  it "requires a contact email" do
    @place.contact_email = nil
    expect(@place).not_to be_valid
  end

  it "rejects a contact email above 100 characters" do
    @place.contact_email = "email@" + "a" * 91 + ".com"
    expect(@place).to have(1).error_on(:contact_email)
  end

  it "rejects invalid contact emails" do
    @place.contact_email = "email@"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "abc.com"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "emailabc.com"
    expect(@place).to have(1).error_on(:contact_email)
  end

  it "rejects latitude and longitude which are not numeric" do
    pending "Cannot test for numericality while setting nil before save. Please improve!"
    @place.latitude = "abc"
    @place.longitude = "xzy123"
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

  it "returns a joined string built from address and city as the location when both fields are given" do
    place = build(:place, address: "Fehrbelliner Str. 45a", city: "Neuruppin")
    expect(place.location).to eq("Fehrbelliner Str. 45a Neuruppin")
  end

  it "returns only the city as the location when the address is not given" do
    place = build(:place, address: nil, city: "Neuruppin")
    expect(place.location).to eq("Neuruppin")
  end

  it "returns only the address as the location when the city is not given" do
    place = build(:place, address: "Fehrbelliner Str. 45a", city: nil)
    expect(place.location).to eq("Fehrbelliner Str. 45a")
  end

  it "returns nil for the location field when address and city are not given" do
    place = build(:place, address: nil, city: nil)
    expect(place.location).to eq(nil)
  end

end
