require 'rails_helper'

describe Place, type: :model  do

  before do
    @place = build(:place)
    @user = create(:user)
    @another_user = create(:user, name: 'Another user')
    @admin = create(:admin)
  end

  it 'should be valid' do
    expect(@place).to be_valid
  end

  it 'requires a name' do
    @place.name = ''
    expect(@place).not_to be_valid
  end

  it 'rejects a name longer than 100 characters' do
    long_name = 'a' * 101
    @place.name = long_name
    expect(@place).not_to be_valid
  end

  it 'accepts an empty city string' do
    @place.city = ''
    expect(@place).to be_valid
  end

  it 'rejects a city longer than 100 characters' do
    long_city = 'a' * 101
    @place.city = long_city
    expect(@place).not_to be_valid
  end

  it 'accepts an empty address' do
    @place.address = ''
    expect(@place).to be_valid
  end

  it 'rejects an address longer than 100 characters' do
    long_address = 'a' * 101
    @place.address = long_address
    expect(@place).not_to be_valid
  end

  it 'rejects the boolean flag is_established which is nil' do
    @place.is_established = nil
    expect(@place).not_to be_valid
  end

  it 'accepts the boolean flag is_established when true' do
    @place.is_established = true
    expect(@place).to be_valid
  end

  it 'accepts the boolean flag is_established when false' do
    @place.is_established = false
    expect(@place).to be_valid
  end

  it 'prefixes the url with a protocol if required' do
  end

  it 'inserts a relation editors' do
    place = build(:place, name: 'A place')
    @place.places << place
    expect(@place.places).to include(place)
  end

  it 'removes a relation editors' do
    place = build(:place, name: 'A place')
    @place.places << place
    @place.places.delete(place)
    expect(@place.places.count).to eql(0)
  end

  it 'replaces an existing relation editors' do
    partner_place = create(:place, name: 'Partnerplace')
    @place.places = [partner_place]
    @place.places =[]
    expect(@place.places.count).to eql(0)
  end

  it 'inserts an ownership' do
    user = create(:user)
    @place.users << user
    expect(@place.users).to include(user)
  end

  it 'removes an ownership' do
    user = create(:user)
    @place.users << user
    @place.users.delete(user)
    @place.save!
    expect(@place.users).not_to include(user)
  end

  it 'replaces an existing ownership' do
    user = create(:user)
    @place.users = [user]
    @place.users =[]
    expect(@place.users.count).to eql(0)
  end

  it 'returns a joined string built from address and city as the location when both fields are given' do
    place = build(:place, address: 'Fehrbelliner Str. 45a', city: 'Neuruppin')
    expect(place.location).to eq('Fehrbelliner Str. 45a Neuruppin')
  end

  it 'returns only the city as the location when the address is not given' do
    place = build(:place, address: nil, city: 'Neuruppin')
    expect(place.location).to eq('Neuruppin')
  end

  it 'returns only the address as the location when the city is not given' do
    place = build(:place, address: 'Fehrbelliner Str. 45a', city: nil)
    expect(place.location).to eq('Fehrbelliner Str. 45a')
  end

  it 'returns nil for the location field when address and city are not given' do
    place = build(:place, address: nil, city: nil)
    expect(place.location).to eq(nil)
  end

  context 'for a guest user' do
    it 'rejects authorization' do
      @place.users = [@user]
      expect(@place.authorized?(nil)).to be_falsey
    end
  end

  context 'for a user without ownership' do
    it 'rejects authorization' do
      @place.users = [@another_user]
      expect(@place.authorized?(@user)).to be_falsey
    end
  end

  context 'for the owner' do
    it 'grants authorization' do
      @place.users = [@user]
      expect(@place.authorized?(@user)).to be_truthy
    end
  end

  context 'for an admin user' do
    it 'grants authorization' do
      expect(@place.authorized?(@admin)).to be_truthy
    end
  end

end
