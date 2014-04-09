class Faq < ActiveRecord::Base
  attr_accessible :answer, :enabled, :locale, :priority, :question

  validates :priority, numericality: { only_integer: true, greater_than: 0 }, allow_blank: true
  validates :question, presence: true, length: { maximum: 100 }
  validates :answer, presence: true, length: { maximum: 5000 }
  validates :locale, presence: true, length: { maximum: 10 }
end
