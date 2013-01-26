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
end
