require 'spec_helper'

describe PlaceMessage, type: :model  do
  before { @place_message = build(:place_message) }

  it "should be valid" do
    expect(@place_message).to be_valid
  end

  it "rejects a name value which is nil" do
    @place_message.name = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a name value which is longer then 100 characters" do
    @place_message.name = "a" * 101
    expect(@place_message).not_to be_valid
  end

  it "rejects a email value which is nil" do
    @place_message.email = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a email value which is longer then 100 characters" do
    @place_message.email = "a" * 101
    expect(@place_message).not_to be_valid
  end

  it "rejects a message value which is nil" do
    @place_message.message = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a message value which is longer then 2000 characters" do
    @place_message.message = "a" * 2001
    expect(@place_message).not_to be_valid
  end
end
