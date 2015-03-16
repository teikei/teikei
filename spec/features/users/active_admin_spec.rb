require 'rails_helper'

describe 'Active Admin', type: :feature do

  before(:all) do
    I18n.locale = :en
  end

  it "authorizes a superadmin" do
    @user = create(:superadmin)
    sign_in @user
    visit "/admin"
    expect(page).to have_content "Dashboard"
  end

  it "denies access for a regular user" do
    @user = create(:user)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content I18n.t("errors.authorization_denied")
  end

  it "denies access for a regular administrator" do
    @user = create(:admin)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content I18n.t("errors.authorization_denied")
  end

  it "denies access for a guest who is not signed in" do
    sign_out
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "You need to sign in"
  end

end
