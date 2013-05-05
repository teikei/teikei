require 'spec_helper'

describe 'Edit User' do

  before(:each) do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    @user = create(:user)
    sign_in @user
    visit edit_user_registration_path
  end

  it 'User changes the password' do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mynewpassword'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User changes the username' do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    fill_in I18n.t('devise.registrations.edit.name'), with: 'New Name'
    fill_in I18n.t('devise.registrations.edit.current_password'), with: @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('devise.registrations.updated')
  end

  it 'User enters wrong existing password' do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mynewpassword'
    find('.js-current-password').set 'wrongpassword'
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.current_password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.current_password.invalid')
  end

  it 'User enters mismatched password and confirmation' do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    find('.js-password').set 'mynewpassword'
    find('.js-password-confirmation').set 'mismatchedpassword'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.confirmation')
  end

  it "User enters too short password" do
    pending "First broken in commit 0b19b75be46ade5569371424c6023971b9edccfc."
    find('.js-password').set '123'
    find('.js-password-confirmation').set '123'
    find('.js-current-password').set @user.password
    click_button I18n.t('devise.registrations.edit.submit')
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.too_short')
  end

end

