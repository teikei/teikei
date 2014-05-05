require 'spec_helper'

feature 'View the homepage' do
  scenario 'user sees relevant page title' do
    visit root_path
    expect(page).to have_title(I18n.t("application_name_title", default: "Application name"))
  end
end
