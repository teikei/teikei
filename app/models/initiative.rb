class Initiative < Place
  attr_accessible :goals

  has_and_belongs_to_many :goals, join_table: :goals_initiatives
  accepts_nested_attributes_for :goals

  def goal_keys
    self.goals.map(&:key)
  end

  resourcify
end
