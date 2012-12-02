require 'spec_helper.rb'

feature "Sign up", %q{
  In order to get access to protected features of the site
  As a visitor
  I want to be able to sign up
} do

  background do
    sign_out
  end

  scenario "User signs up with valid data" do
    user  = build(:user)
    sign_up user
    expect(page).to have_content "Welcome! You have signed up successfully."
    expect_user_to_be_signed_in
  end

  scenario "User signs up with invalid email" do
    user = build(:user, email: "notanemail")
    sign_up user
    expect(page).to have_content "is invalid"
    expect_user_not_to_be_signed_in
  end

  scenario "User signs up without password" do
    user = build(:user, password: "")
    sign_up user
    expect(page).to have_content "can't be blank"
    expect_user_not_to_be_signed_in
  end

  scenario "User signs up with too short password" do
    user = build(:user, password: "123", password_confirmation: "123")
    sign_up user
    expect(page).to have_content "is too short"
    expect_user_not_to_be_signed_in
  end

  scenario "User signs up without password confirmation" do
    user = build(:user, password_confirmation: "")
    sign_up user
    expect(page).to have_content "doesn't match confirmation"
    expect_user_not_to_be_signed_in
  end

  scenario "User signs up with mismatched password and confirmation" do
    user = build(:user, password_confirmation: "")
    sign_up user
    expect(page).to have_content "doesn't match confirmation"
    expect_user_not_to_be_signed_in
  end

end
