require 'spec_helper'

describe 'Edit User' do

  before(:each) do
    @user = create(:user)
    sign_in @user
  end

  it 'User changes the password' do
    click_link 'Edit account'
    fill_in 'user_password', with: 'mynewpassword'
    fill_in 'user_password_confirmation', with: 'mynewpassword'
    fill_in 'Current password', with: @user.password
    click_button 'Update'
    expect(page).to have_content 'You updated your account successfully.'
  end

  it 'User changes the username' do
    click_link 'Edit account'
    fill_in 'Name', with: 'New Name'
    fill_in 'Current password', with: @user.password
    click_button 'Update'
    expect(page).to have_content 'You updated your account successfully.'
  end

  it 'User enters wrong existing password' do
    click_link 'Edit account'
    fill_in 'user_password', with: 'mynewpassword'
    fill_in 'user_password_confirmation', with: 'mynewpassword'
    fill_in 'Current password', with: 'wrongpassword'
    click_button 'Update'
    expect(page).to have_content 'is invalid'
  end

  it 'User enters mismatched password and confirmation' do
    click_link 'Edit account'
    fill_in 'user_password', with: 'mynewpassword'
    fill_in 'user_password_confirmation', with: 'mismatchedpassword'
    fill_in 'Current password', with: @user.password
    click_button 'Update'
    expect(page).to have_content "doesn't match confirmation"
  end

  it "User enters too short password" do
    click_link 'Edit account'
    fill_in 'user_password', with: '123'
    fill_in 'user_password_confirmation', with: '123'
    fill_in 'Current password', with: @user.password
    click_button 'Update'
    expect(page).to have_content 'is too short'
  end

end

