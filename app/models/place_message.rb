# encoding: UTF-8
class PlaceMessage < MailForm::Base
  attribute :sender_name,            validate: true
  attribute :sender_email,    validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message,         validate: true
  attribute :recipient_email, validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :recipient_name,  validate: true
  attribute :mail_form_path,  validate: true
  attribute :place_name,      validate: true

  validates :sender_name, presence: true, length: { maximum: 100 }
  validates :sender_email, presence: true, length: { maximum: 100 }
  validates :message, presence: true, length: { maximum: 1000 }
  validates :recipient_email, presence: true, length: { maximum: 100 }

  def headers
    {
      subject: %(Nachricht für #{place_name}),
      from: %("#{sender_name}" <#{sender_email}>),
      to: %("#{recipient_name}" <#{recipient_email}>)
    }
  end

  # This composes a message compiled from 2 sources:
  # 1) The form data entered to the place details form
  # 2) Additional message data retrieved from the associate place model
  #    The email is sent to the stored contact address of the place
  def self.new_manual_contact_message(place, form_data, mail_form_path)
    message_data = Hash.new
    message_data["recipient_email"] = place.contact_email
    message_data["recipient_name"] = place.contact_name
    message_data["sender_name"] = form_data[:sender_name]
    message_data["sender_email"] = form_data[:sender_email]
    message_data["message"] = form_data[:message]
    message_data["mail_form_path"] = mail_form_path
    message_data["place_name"] = place.name
    message = PlaceMessage.new(message_data)
  end

end
