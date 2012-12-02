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
    expect(page).to have_content "Sign up"
    expect(page).to have_content "Login"
    expect(page).not_to have_content "Logout"
  end

  scenario "User signs in successfully" do
    create(:user)
    visitor = build(:user)
    sign_in visitor
    expect(page).to have_content "Signed in successfully."
    visit '/'
    expect(page).to have_content "Logout"
    expect(page).not_to have_content "Sign up"
    expect(page).not_to have_content "Login"
  end

  scenario "User enters wrong email" do
    create(:user)
    visitor = build(:user, email: "wrong@example.com")
    sign_in visitor
    expect(page).to have_content "Invalid email or password."
    expect(page).to have_content "Sign up"
    expect(page).to have_content "Login"
    expect(page).not_to have_content "Logout"
  end

  scenario "User enters wrong password" do
    create(:user)
    visitor = build(:user, password: "wrongpass")
    sign_in visitor
    expect(page).to have_content "Invalid email or password."
    expect(page).to have_content "Sign up"
    expect(page).to have_content "Login"
    expect(page).not_to have_content "Logout"
  end

end
