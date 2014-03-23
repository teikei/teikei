class Faq < ActiveRecord::Base
  attr_accessible :answer, :enabled, :locale, :priority, :question
end
