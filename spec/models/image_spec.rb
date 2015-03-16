require 'rails_helper'

describe Image, type: :model  do
  let(:image) { build(:image) }

  it "should be valid" do
    expect(image).to be_valid
  end
end
