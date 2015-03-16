require 'spec_helper'

describe 'Sign Out', type: :feature do

  before(:each) do
    user =  create(:user)
    sign_in user
  end

  it 'signs out the current user' do
    sign_out
    expect(page).to have_content I18n.t('devise.sessions.signed_out')
  end

end
