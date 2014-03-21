class Ability
  include CanCan::Ability

  def initialize(user)
    # Create guest user aka. anonymous (not logged-in) when user is nil.
    user ||= User.new

    if user.has_role? :admin
      can :manage, :all
    elsif user.has_role? :user
      can :manage, Farm do |farm|
        farm.authorized?(user)
      end
      can :create, Farm
      can :manage, Depot do |depot|
        depot.authorized?(user)
      end
      can :create, Depot
      can :create, Image
      can :read, :all
      can :geocode, :location
    else
       # guest user aka. anonymous
      can :read, :all
    end
  end
end
