class PlaceMessage < MailForm::Base
  attribute :name,      :validate => true
  attribute :email,     :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message,   :validate => true
  attribute :to,        :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i

  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, length: { maximum: 100 }
  validates :message, presence: true, length: { maximum: 1000 }
  validates :to, presence: true, length: { maximum: 100 }

  def headers
    {
      :subject => "Nachricht von ernte-teilen.org",
      :from => %("#{name}" <#{email}>),
      :to => to
    }
  end
end
