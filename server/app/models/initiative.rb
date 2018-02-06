class Initiative < Place

  resourcify

  attr_accessible :goals

  has_and_belongs_to_many :goals, join_table: :goals_initiatives
  accepts_nested_attributes_for :goals

  after_create :notify_admins

  def goal_keys
    self.goals.map(&:key)
  end

  private

  def notify_admins
    User.with_role(:admin).each do |admin|
      AppMailer.admin_notification(self, admin).deliver_now
    end
  end
end
