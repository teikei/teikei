require 'spec_helper'

describe Place do
  before { @place = build(:place) }

  it "should be a valid" do
    expect(@place).to be_valid
  end

  it "geocodes the location when being saved" do
    @place.save!

    expect(@place.latitude).not_to be_nil
    expect(@place.longitude).not_to be_nil
  end

  it "inserts a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm.place
    expect(@place.places).to include(farm.place)
  end

  it "removes a relation entry" do
    farm = build(:farm, name: "A farm")
    @place.places << farm.place
    @place.places.delete(farm.place)
    expect(@place.places).to eql([])
  end

  it "replaces an existing relation entry" do
    farm = create(:farm)

    partner_farm = create(:farm, name: "Partnerfarm")
    farm.places = [partner_farm.place]
    farm.save!
    farm.reload

    # TODO this is a workaround to avoid an
    # ActiveRecord::AssociationMismatch Exception
    # when replacing the 'places' association in the
    # statement that follows.
    # (probably an issue with multiple_table_inheritance)
    farm.places.each { |p| farm.places.delete(p.place) }
    farm.save!
    farm.reload

    farm.places =[]
    expect(farm.places).to eql([])
  end
end
