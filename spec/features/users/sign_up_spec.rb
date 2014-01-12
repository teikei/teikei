require 'spec_helper'
describe 'Sign up' do

  before(:each) do
    sign_out
  end

  it 'signs up a visitor with valid data and shows information about the confirmation email' do
    user  = build(:user)
    sign_up user
    expect(page).to have_content I18n.t('devise.registrations.signed_up_but_unconfirmed')
  end

  it 'does not sign up a visitor with invalid email' do
    user = build(:user, email: 'notanemail')
    sign_up user
    expect(page).to have_content I18n.t('activerecord.attributes.user.email')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.email.invalid')
  end

  it 'does not sign up a visitor without password' do
    user = build(:user, password: '')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.blank')
  end

  it 'does not sign up a visitor with too short password' do
    user = build(:user, password: '123', password_confirmation: '123')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.too_short')
  end

  it 'does not sign up a visitor without password confirmation' do
    user = build(:user, password_confirmation: '')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password_confirmation.blank')
  end

  it 'does not sign up a visitor with mismatched password and confirmation' do
    user = build(:user, password: 'secretpassword', password_confirmation: 'passwordsecret')
    expect { sign_up user }.not_to change { User.count }
    expect(page).to have_content I18n.t('activerecord.attributes.user.password')
    expect(page).to have_content I18n.t('activerecord.errors.models.user.attributes.password.confirmation')
  end

end
