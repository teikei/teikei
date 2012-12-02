require 'spec_helper.rb'

feature 'Manage farms', %q{
  In order to participate as a farmer
  Aa a registered user
  I want to be able to manage my farms
} do

  background do
    user = create(:user)
    sign_in user
    click_link "Farms"
  end

  scenario "User views farms" do
    user.farms.each do |farm|
      expect(page).to have_content farm.name
      expect(page).to have_content farm.location
    end
  end

  scenario "User adds a farm" do
    pending
  end

  scenario "User changes farm name" do
    pending
  end

  scenario "User changes farm location" do
    pending
  end

  scenario "User edits farm of another user" do
    pending
  end

  scenario "User deletes farm" do
    pending
  end

  scenario "User deletes a farm of another user" do
    pending
  end

end
