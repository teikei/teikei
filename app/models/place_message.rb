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
end
