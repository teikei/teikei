class ConfirmationMailer < ActionMailer::Base
  default from: ENV["EMAIL_SENDER_ADDRESS"]

  def confirmation_email(user)
    @user = user
    mail(
      to: "#{user.name} <#{user.email}>",
      subject: I18n.t("devise.mailer.confirmation_instructions.subject")
    )
  end
end
