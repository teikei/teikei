class AppMailer < ActionMailer::Base

  def admin_message(message, recipient)
    @message = message
    @recipient = recipient
    mail(
        from: ENV['SENDER_EMAIL'],
        reply_to: message.email,
        to: %("#{@recipient.name}" <#{@recipient.email}>),
        subject: "Nachricht von #{message.name} #{message.email}"
    )
  end

  def admin_notification(place, recipient)
    @place = place
    @user = place.users.first
    @recipient = recipient
    mail(
        from: ENV['SENDER_EMAIL'],
        to: %("#{@recipient.name}" <#{@recipient.email}>),
        subject: "Es wurde ein neuer Eintrag angelegt: #{place.name}"
    )
  end

  def place_message(place, message)
    @place = place
    @message = message
    @recipient = place.users.first
    mail(
        from: ENV['SENDER_EMAIL'],
        reply_to: message.email,
        to: %("#{@recipient.name}" <#{@recipient.email}>),
        subject: %(Nachricht für #{@place.name})
    )
  end
end
