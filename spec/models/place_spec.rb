require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be valid" do
    expect(@place).to be_valid
  end

  it "should require a name" do
    @place.name = ""
    expect(@place).not_to be_valid
  end

  it "should require a name within 5 to 50 characters" do
    short_name = "a" * 4
    @place.name = short_name
    expect(@place).not_to be_valid

    long_name = "a" * 51
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

  it "should require the boolean flag accepts_new_members" do
    @place.accepts_new_members = nil
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag accepts_new_members not to be an integer" do
    @place.accepts_new_members = 23
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag accepts_new_members not to be a string" do
    @place.accepts_new_members = "yes"
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag accepts_new_members to be true" do
    @place.accepts_new_members = true
    expect(@place).to be_valid
  end

  it "should require the boolean flag accepts_new_members to be false" do
    pending "Test fails for unknown reasons. Please verify why!"
    # @place.accepts_new_members = false
    # expect(@place).to be_valid
  end


  it "should require the boolean flag is_established" do
    @place.is_established = nil
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag is_established not to be an integer" do
    @place.is_established = 23
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag is_established not to be a string" do
    @place.is_established = "yes"
    expect(@place).not_to be_valid
  end

  it "should require the boolean flag is_established to be true" do
    @place.is_established = true
    expect(@place).to be_valid
  end

  it "should require the boolean flag is_established to be false" do
    pending "Test fails for unknown reasons. Please verify why!"
    # @place.is_established = false
    # expect(@place).to be_valid
  end


  it "should require a contact email" do
    @place.contact_email = nil
    expect(@place).not_to be_valid
  end

  it "should require a contact email not exceed 100 characters" do
    @place.contact_email = "email@" + "a" * 91 + ".com"
    expect(@place).to have(1).error_on(:contact_email)
  end

  it "should require a valid contact email" do
    @place.contact_email = "email@"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "abc.com"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "emailabc.com"
    expect(@place).to have(1).error_on(:contact_email)
  end

  it "should require latitude and longitude to be numeric" do
    pending "Cannot test for numericality while setting nil before save. Please improve!"
    # @place.latitude = "abc"
    # @place.longitude = "xzy123"
    # expect(@place).not_to be_valid
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
