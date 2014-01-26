# encoding: UTF-8
class PlaceMessage < MailForm::Base
  attribute :name,            validate: true
  attribute :email,           validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message,         validate: true
  attribute :to,              validate: /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :recipient_name,  validate: true
  attribute :mail_form_path,  validate: true
  attribute :place_name,      validate: true

  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, length: { maximum: 100 }
  validates :message, presence: true, length: { maximum: 1000 }
  validates :to, presence: true, length: { maximum: 100 }

  def headers
    {
      subject: %(Nachricht für #{place_name}),
      from: %("#{name}" <#{email}>),
      to: %("#{recipient_name}" <#{to}>)
    }
  end

  # This composes a message compiled from 2 sources:
  # 1) The form data entered to the place details form
  # 2) Additional message data retrieved from the associate place model
  #    The email is sent to the stored contact address of the place
  def self.new_manual_contact_message(place, form_data, mail_form_path)
    message_data = Hash.new
    message_data["to"] = place.contact_email
    message_data["recipient_name"] = place.contact_name
    message_data["name"] = form_data[:name]
    message_data["email"] = form_data[:email]
    message_data["message"] = form_data[:message]
    message_data["mail_form_path"] = mail_form_path
    message_data["place_name"] = place.name
    message = PlaceMessage.new(message_data)
  end

end
