class UserMailer < ActionMailer::Base
  default to: ENV["GMAIL_USERNAME"]
  helper Teikei::Permalinks

  def place_message_email(place, message)
    @place = place
    @message = message
    mail(
      from: %("#{message.name}" <#{message.email}>),
      to: %("#{place.contact_name}" <#{place.contact_email}>),
      subject: %(Nachricht für #{place.name})
    )
  end
end
