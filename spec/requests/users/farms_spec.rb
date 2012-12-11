require 'spec_helper'

describe 'Manage farms' do

  context 'when the user is signed in' do

    before(:each) do
      @user = create(:user)
      sign_in @user
      click_link 'Farms'
    end

    it "shows the user's farms" do
      @user.farms.each do |farm|
        expect(page).to have_content farm.name
        expect(page).to have_content farm.location
      end
    end

    it 'adds a new farm' do
      pending
    end

    it 'changes a farm name' do
      pending
    end

    it 'changes a farm location' do
      pending
    end

    it "doesn't change the farm of another user" do
      pending
    end

    it 'deletes a farm' do
      pending
    end

    it "doesn't delete a farm of another user" do
      pending
    end
  end

end
