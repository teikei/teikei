require 'spec_helper'
describe 'Sign up' do

  before(:each) do
    sign_out
  end

  it 'signs up a visitor with valid data' do
    user  = build(:user)
    expect(page).to have_content 'Welcome! You have signed up successfully.'
    expect_user_to_be_signed_in
  end

  it 'does not sign up a visitor with invalid email' do
    user = build(:user, email: 'notanemail')
    sign_up user
    expect(page).to have_content 'is invalid'
    expect_user_not_to_be_signed_in
  end

  it 'does not sign up a visitor without password' do
    user = build(:user, password: '')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content "can't be blank"
    expect_user_not_to_be_signed_in
  end

  it 'does not sign up a visitor with too short password' do
    user = build(:user, password: '123', password_confirmation: '123')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content 'is too short'
    expect_user_not_to_be_signed_in
  end

  it 'does not sign up a visitor without password confirmation' do
    user = build(:user, password_confirmation: '')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content "doesn't match confirmation"
    expect_user_not_to_be_signed_in
  end

  it 'does not sign up a visitor with mismatched password and confirmation' do
    user = build(:user, password_confirmation: '')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content "doesn't match confirmation"
    expect_user_not_to_be_signed_in
  end

end
