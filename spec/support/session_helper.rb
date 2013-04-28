module SessionHelper
# Helpers for common user account actions and expectations.
  def sign_in(user)
    sign_out # make sure no user is currently logged in
    click_link I18n.t('devise.sessions.new.sign_in')
    fill_in I18n.t('devise.sessions.new.email'), with: user.email
    fill_in I18n.t('devise.sessions.new.password'), with: user.password
    click_button I18n.t('devise.sessions.new.submit')
  end

  def sign_up(user)
    click_link I18n.t('layouts.navigation.sign_up')
    fill_in I18n.t('devise.registrations.new.name'), with: user.name
    fill_in I18n.t('devise.registrations.new.email'), with: user.email
    find('.js-password').set user.password
    find('.js-password-confirmation').set user.password_confirmation
    click_button I18n.t('devise.registrations.new.submit')
  end

  def sign_out
    visit '/users/sign_out'
  end

  def expect_user_to_be_signed_in
    expect(page).to have_content I18n.t('layouts.navigation.sign_out')
    expect(page).not_to have_content I18n.t('layouts.navigation.sign_up')
    expect(page).not_to have_content I18n.t('layouts.navigation.sign_in')
  end

  def expect_user_not_to_be_signed_in
    expect(page).to have_content I18n.t('devise.registrations.new.title')
    expect(page).to have_content I18n.t('layouts.navigation.sign_in')
    expect(page).not_to have_content I18n.t('layouts.navigation.sign_out')
  end
end

module ApiSessionHelper
  def api_sign_in(base_url, user)
    params = {}
    params[:user] = {email: user.email, password: user.password}
    post "#{base_url}/sessions.json", params
  end

  def api_sign_out(base_url, user)
    delete "#{base_url}/sessions/#{user.id}.json"
  end
end
