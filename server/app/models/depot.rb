class Depot < Place

  resourcify

  attr_accessible :place_ids, :delivery_days

  after_create :notify_admins

  validates :delivery_days, length: { maximum: 1000 }

  def aggregated_places
    # return all (directly) related farms of the depot
    network = related_farms.dup
    # and everything else related to these farms
    related_farms.each do |farm|
     network.push(*farm.related_places)
    end
    # exclude the current depot
    network.reject { |p| p == self }
  end

  private

  def notify_admins
    User.with_role(:admin).each do |admin|
      AppMailer.admin_notification(self, admin).deliver_now
    end
  end

end
