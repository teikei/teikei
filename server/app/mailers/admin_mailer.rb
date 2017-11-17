class AdminMailer < ActionMailer::Base
  default to: ENV['GMAIL_USERNAME']

  def message_email(message)
    @message = message
    mail(
      from: "#{message.email}",
      subject: "Nachricht von #{message.name}"
    )
  end
end
