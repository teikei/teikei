require 'spec_helper'

describe Image do
  let(:image) { build(:image) }

  it "should be valid" do
    expect(image).to be_valid
  end
end
