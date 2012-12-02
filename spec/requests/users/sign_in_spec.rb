require 'spec_helper.rb'

feature "Sign in", %q{
  To get access to protected sections of the site
  A visitor
  Should be able to sign in
} do

  background do
    sign_out
  end

  scenario "User is not signed up" do
    visitor = build(:user)
    sign_in visitor
    expect(page).to have_content "Invalid email or password."
    expect_user_not_to_be_signed_in
  end

  scenario "User signs in successfully" do
    create(:user)
    visitor = build(:user)
    sign_in visitor
    expect(page).to have_content "Signed in successfully."
    visit '/'
    expect_user_to_be_signed_in
  end

  scenario "User enters wrong email" do
    create(:user)
    visitor = build(:user, email: "wrong@example.com")
    sign_in visitor
    expect(page).to have_content "Invalid email or password."
    expect_user_not_to_be_signed_in
  end

  scenario "User enters wrong password" do
    create(:user)
    visitor = build(:user, password: "wrongpass")
    sign_in visitor
    expect(page).to have_content "Invalid email or password."
    expect_user_not_to_be_signed_in
  end

end
