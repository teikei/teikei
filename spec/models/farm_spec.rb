require 'spec_helper'

describe Farm do
  before { @farm = build(:farm) }

  it "should be a valid" do
    expect(@farm).to be_valid
  end

  it "geocodes the location when being saved" do
    @farm.save!

    expect(@farm.lat).not_to be_nil
    expect(@farm.lng).not_to be_nil
  end
end
