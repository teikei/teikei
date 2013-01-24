require 'spec_helper'


describe 'Sign Out' do

  before(:each) do
    user =  create(:user)
    sign_in user
  end

  it 'signs out the current user' do
    sign_out
    expect(page).to have_content 'Signed out successfully.'
    visit '/'
    expect_user_not_to_be_signed_in
  end

end
