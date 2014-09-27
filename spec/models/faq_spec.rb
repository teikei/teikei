require 'spec_helper'

describe Faq, type: :model  do
  it "should be possible to create one" do
    expect(create(:faq)).to be_valid
  end

  it "should refuse Faq without question" do
    expect(Faq.create(question: nil, answer: "Yo.", locale: "en")).not_to be_valid
  end

  it "should refuse Faq without answer" do
    expect(Faq.create(question: "What?", answer: nil, locale: "en")).not_to be_valid
  end

  it "should refuse Faq without locale" do
    expect(Faq.create(question: "What?", answer: "Yo,", locale: nil)).not_to be_valid
  end

end
