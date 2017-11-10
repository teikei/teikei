class UserMailer < ActionMailer::Base
  helper Teikei::Permalinks

  def place_message_email(place, message)
    @place = place
    @message = message
    @recipient = place.users.first
    mail(
      from: %("#{@message.name}" <#{@message.email}>),
      to: %("#{@recipient.name}" <#{@recipient.email}>),
      subject: %(Nachricht für #{@place.name})
    )
  end
end
