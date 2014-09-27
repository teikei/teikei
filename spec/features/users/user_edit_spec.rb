require 'rails_helper'

describe 'Edit User', type: :feature do

  before(:each) do
    @user = create(:user)
    sign_in @user
    visit edit_user_registration_path
  end

  it 'User changes the password' do
    fill_in I18n.t('activerecord.attributes.user.password'), with: 'mynewpassword'
    fill_in I18n.t('activerecord.attributes.user.password_confirmation'), with: 'mynewpassword'
    fill_in I18n.t('activerecord.attributes.user.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User changes the username' do
    fill_in I18n.t('activerecord.attributes.user.name'), with: 'New Name'
    fill_in I18n.t('activerecord.attributes.user.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User enters wrong existing password' do
    fill_in I18n.t('activerecord.attributes.user.password'), with: 'mynewpassword'
    fill_in I18n.t('activerecord.attributes.user.password_confirmation'), with: 'mynewpassword'
    fill_in I18n.t('activerecord.attributes.user.current_password'), with: 'wrongpassword'
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.current_password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.current_password.invalid')
  end

  it 'User enters mismatched password and confirmation' do
    fill_in I18n.t('activerecord.attributes.user.password'), with: 'mynewpassword'
    fill_in I18n.t('activerecord.attributes.user.password_confirmation'), with: 'mismatchedpassword'
    fill_in I18n.t('activerecord.attributes.user.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.confirmation')
  end

  it "User enters too short password" do
    fill_in I18n.t('activerecord.attributes.user.password'), with: '123'
    fill_in I18n.t('activerecord.attributes.user.password_confirmation'), with: '123'
    fill_in I18n.t('activerecord.attributes.user.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.too_short')
  end
end

