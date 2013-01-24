require 'spec_helper'

describe Depot do
  before { @depot = build(:depot) }

  it "should be a valid" do
    expect(@depot).to be_valid
  end

  it "geocodes the location when being saved" do
    @depot.save!

    expect(@depot.lat).not_to be_nil
    expect(@depot.lng).not_to be_nil
  end
end
