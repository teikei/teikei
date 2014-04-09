require 'spec_helper'

describe Faq do
  it "should be possible to create one" do
    create(:faq).should be_valid
  end

  it "should refuse Faq without question" do
    Faq.create(question: nil, answer: "Yo.", locale: "en").should_not be_valid
  end

  it "should refuse Faq without answer" do
    Faq.create(question: "What?", answer: nil, locale: "en").should_not be_valid
  end

  it "should refuse Faq without locale" do
    Faq.create(question: "What?", answer: "Yo,", locale: nil).should_not be_valid
  end

end
