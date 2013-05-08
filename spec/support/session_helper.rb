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
    expect(page).to have_css "body.home"
    expect(page).not_to have_css "body.sessions"
  end

  def expect_user_not_to_be_signed_in
    expect(page).not_to have_css "body.home"
    expect(page).to have_css "body.sessions"
  end
end

module ApiSessionHelper
  def api_sign_in(base_url, user)
    # TODO: think about separate API access with token authentication that
    # does not depend on any server sessions.
    params = {}
    params[:user] = {email: user.email, password: user.password}
    post "/users/sign_in.json", params
  end

  def api_sign_out(base_url, user)
    get "/users/sign_out"
    follow_redirect!
  end
end
