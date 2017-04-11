class Goal < ActiveRecord::Base
  attr_accessible :key, :description

  has_and_belongs_to_many :initiatives, join_table: :goals_initiatives
end
