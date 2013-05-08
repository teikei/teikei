class ContactMessage < MailForm::Base
  attribute :name,      :validate => true
  attribute :email,     :validate => /\A([\w\.%\+\-]+)@([\w\-]+\.)+([\w]{2,})\z/i
  attribute :message,   :validate => true

  def headers
    {
      :subject => "Contact Message",
      :to => ENV["GMAIL_USERNAME"],
      :from => %("#{name}" <#{email}>)
    }
  end
end
