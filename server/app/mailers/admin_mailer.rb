class AdminMailer < ActionMailer::Base
  default to: ENV['GMAIL_USERNAME']

  def message_email(message)
    @message = message
    mail(
        from: "#{message.email}",
        subject: "Nachricht von #{message.name}"
    )
  end

  def new_place_notification(place)
    @place = place
    mail(
        from: 'Ernte Teilen Website',
        subject: "Es wurde ein neuer Eintrag angelegt: #{place.name}"
    )

  end
end
