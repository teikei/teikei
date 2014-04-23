class ContactMessage
  include ActiveModel::Validations
  include ActiveModel::Conversion
  extend ActiveModel::Naming

  attr_accessor :id, :name, :email, :message

  validates :name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, email: true, length: { maximum: 100 }
  validates :message, presence: true, length: { maximum: 2000 }

  def initialize(attributes = {})
    unless attributes.nil?
      attributes.each do |name, value|
        send("#{name}=", value)
      end
    end
  end

  def persisted?
    false
  end
end
