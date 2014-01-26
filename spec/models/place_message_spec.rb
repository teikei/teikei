require 'spec_helper'

describe PlaceMessage do

  before { @place_message = build(:place_message) }

  it "should be valid" do
    expect(@place_message).to be_valid
  end

  it "rejects a sender_name value which is nil" do
    @place_message.sender_name = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a sender_name value which is longer then 100 characters" do
    @place_message.sender_name = "a" * 101
    expect(@place_message).not_to be_valid
  end

  it "rejects a sender_email value which is nil" do
    @place_message.sender_email = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a sender_email value which is longer then 100 characters" do
    @place_message.sender_email = "a" * 101
    expect(@place_message).not_to be_valid
  end

  it "rejects a message value which is nil" do
    @place_message.message = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a message value which is longer then 100 characters" do
    @place_message.message = "a" * 1001
    expect(@place_message).not_to be_valid
  end

  it "rejects a to value which is nil" do
    @place_message.to = nil
    expect(@place_message).not_to be_valid
  end

  it "rejects a to value which is longer then 100 characters" do
    @place_message.to = "a" * 101
    expect(@place_message).not_to be_valid
  end

end
