module SessionHelper
# Helpers for common user account actions and expectations.
  def sign_in(user)
    sign_out # make sure no user is currently logged in
    click_link 'Login'
    fill_in 'Email', with: user.email
    fill_in 'Password', with: user.password
    click_button 'Sign in'
  end

  def sign_up(user)
    click_link 'Sign up'
    fill_in 'Name', with: user.name
    fill_in 'Email', with: user.email
    fill_in 'user_password', with: user.password
    fill_in 'user_password_confirmation', with: user.password_confirmation
    click_button 'Sign up'
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
    expect(page).to have_content I18n.t('layouts.navigation.sign_up')
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
