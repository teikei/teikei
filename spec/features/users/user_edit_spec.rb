require 'spec_helper'

describe 'Edit User' do

  before(:each) do
    @user = create(:user)
    sign_in @user
  end

  it 'User changes the password' do
    click_link I18n.t('layouts.navigation.edit_user')
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mynewpassword'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User changes the username' do
    click_link I18n.t('layouts.navigation.edit_user')
    fill_in I18n.t('devise.registrations.edit.name'), with: 'New Name'
    fill_in I18n.t('devise.registrations.edit.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User enters wrong existing password' do
    click_link I18n.t('layouts.navigation.edit_user')
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mynewpassword'
    find('.js-current-password').set 'wrongpassword'
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.current_password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.current_password.invalid')
  end

  it 'User enters mismatched password and confirmation' do
    click_link I18n.t('layouts.navigation.edit_user')
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mismatchedpassword'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.confirmation')
  end

  it "User enters too short password" do
    click_link I18n.t('layouts.navigation.edit_user')
    find('.js-password').set '123'
    find('.js-password-confirmation').set '123'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.too_short')
  end

end

