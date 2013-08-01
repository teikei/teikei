require 'spec_helper'

describe Place do

  before do
    @place = build(:place)
    @user = create(:user)
    @another_user = create(:user, name: "Another user")
    @admin = create(:admin)
  end

  it "should be valid" do
    expect(@place).to be_valid
  end

  it "requires a name" do
    @place.name = ""
    expect(@place).not_to be_valid
  end

  it "rejects a name shorter than 4 characters" do
    short_name = "a" * 4
    @place.name = short_name
    expect(@place).not_to be_valid
  end

  it "rejects a name longer than 50 characters" do
    long_name = "a" * 51
    @place.name = long_name
    expect(@place).not_to be_valid
  end

  it "rejects an empty city string" do
    @place.city = ""
    expect(@place).not_to be_valid
  end

  it "rejects a city shorter than 3 characters" do
    short_city = "a" * 1
    @place.city = short_city
    expect(@place).not_to be_valid
  end

  it "rejects a city longer than 40 characters" do
    long_city = "a" * 41
    @place.city = long_city
    expect(@place).not_to be_valid
  end

  it "rejects an empty address" do
    @place.address = ""
    expect(@place).not_to be_valid
  end

  it "rejects an address shorter than 6 characters" do
    short_address = "a" * 5
    @place.address = short_address
    expect(@place).not_to be_valid
  end

  it "rejects an address longer than 40 characters" do
    long_address = "a" * 41
    @place.address = long_address
    expect(@place).not_to be_valid
  end

  it "rejects a user id which is nil" do
    @place.user = nil
    expect(@place).not_to be_valid
  end

  it "rejects a user id of type string" do
    @place.user_id = "abc"
    expect(@place).not_to be_valid
  end

  it "rejects a user id of type float" do
    @place.user_id = 23.1
    expect(@place).not_to be_valid
  end

  it "rejects the boolean flag is_established which is nil" do
    @place.is_established = nil
    expect(@place).not_to be_valid
  end

  it "accepts the boolean flag is_established when true" do
    @place.is_established = true
    expect(@place).to be_valid
  end

  it "accepts the boolean flag is_established when false" do
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

  it "requires a contact name" do
    @place.contact_name = nil
    expect(@place).not_to be_valid
  end

  it "rejects a contact name shorter than 2 characters" do
    short_contact_name = "a" * 1
    @place.contact_name = short_contact_name
    expect(@place).not_to be_valid
  end

  it "rejects a contact_name longer than 60 characters" do
    long_contact_name = "a" * 61
    @place.contact_name = long_contact_name
    expect(@place).not_to be_valid
  end

  it "rejects invalid contact emails" do
    @place.contact_email = "email@"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "abc.com"
    expect(@place).to have(1).error_on(:contact_email)

    @place.contact_email = "emailabc.com"
    expect(@place).to have(1).error_on(:contact_email)
  end

  it "rejects invalid contact phones" do
    @place.contact_phone = "foobar 1234"
    expect(@place).not_to be_valid

    @place.contact_phone = "++ 123 12 321 3123"
    expect(@place).not_to be_valid

    @place.contact_phone = "123-123-123 foo"
    expect(@place).not_to be_valid
  end

  it "accepts valid contact phones" do
    @place.contact_phone = "+49 12 3123 123 12 3123"
    expect(@place).to be_valid

    @place.contact_phone = "030 1231-123-123-123"
    expect(@place).to be_valid

    @place.contact_phone = "121231231231231"
    expect(@place).to be_valid

    @place.contact_phone = "030/123123 123 123"
    expect(@place).to be_valid
  end

  it "accepts a blank phone" do
    @place.contact_phone = ''
    expect(@place).to be_valid
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

  context "for a guest user" do
    it "rejects authorization" do
      @place.user = @user
      expect(@place.authorized?(nil)).to be_false
    end
  end

  context "for a user without ownership" do
    it "rejects authorization" do
      @place.user = @another_user
      expect(@place.authorized?(@user)).to be_false
    end
  end

  context "for the owner" do
    it "grants authorization" do
      @place.user = @user
      expect(@place.authorized?(@user)).to be_true
    end
  end

  context "for an admin user" do
    it "grants authorization" do
      expect(@place.authorized?(@admin)).to be_true
    end
  end

end
