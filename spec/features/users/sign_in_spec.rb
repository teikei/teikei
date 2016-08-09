require 'rails_helper'

describe 'Sign in', type: :feature do

  before(:each) do
    sign_out
  end

  it 'does not sign in an unknown user' do
    visitor = build(:user)
    sign_in visitor
    expect(page).to have_content I18n.t('devise.failure.not_found_in_database')
  end

  it 'signs in a user with correct credentials' do
    create(:user, email: 'test@example.com')
    visitor = build(:user, email: 'test@example.com')
    sign_in visitor
    expect(page).to have_content I18n.t('devise.sessions.signed_in')
  end

  it 'does not sign in a user with wrong email' do
    create(:user)
    create(:user, email: 'test@example.com')
    visitor = build(:user, email: 'wrong@example.com')
    sign_in visitor
    expect(page).to have_content I18n.t('devise.failure.not_found_in_database')
  end

  it 'does not sign in a user with wrong password' do
    create(:user, email: 'test@example.com')
    visitor = build(:user, email: 'test@example.com', password: 'wrongpass')
    sign_in visitor
    expect(page).to have_content I18n.t('devise.failure.invalid')
  end
end
