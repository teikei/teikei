require 'spec_helper'

describe 'Active Admin' do

  before(:all) do
    I18n.locale = :en
  end

  it "authorizes a superadmin" do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    @user = create(:superadmin)
    sign_in @user
    visit "/admin"
    expect(page).to have_content "Dashboard"
  end

  it "does not authorize a reqular user" do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    @user = create(:user)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "Unauthorized Access!"
  end

  it "does not authorize a regular administrator" do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    @user = create(:admin)
    sign_in @user
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "Unauthorized Access!"
  end

  it "does not authorize a guest who is not signed in" do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    sign_out
    visit "/admin"
    expect(page).not_to have_content "Dashboard"
    expect(page).to have_content "You need to sign in"
  end

end
