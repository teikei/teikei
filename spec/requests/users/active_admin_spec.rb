require 'spec_helper'

describe 'Active Admin' do

  it "authorizes a superadmin" do
    pending "FIXME: Evaluates false when locale set to German."
    @user = create(:superadmin)
    sign_in @user
    visit "/admin"
    expect(page).to have_content "Dashboard"
  end

  it "does not authorize a reqular user" do
    @user = create(:user)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "Unauthorized Access!"
  end

  it "does not authorize a regular administrator" do
    @user = create(:admin)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "Unauthorized Access!"
  end

  it "does not authorize a guest who is not signed in" do
    pending "FIXME: Evaluates false when locale set to German."
    sign_out
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "You need to sign in"
  end

end
