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
      can :manage, Depot do |depot|
        depot.authorized?(user)
      end
      can :manage, Initiative do |initiative|
        initiative.authorized?(user)
      end
      can :read, Place
      can :read, Depot
      can :create, Depot
      can :read, Farm
      can :create, Farm
      can :read, Initiative
      can :create, Initiative
      can :read, Image
      can :create, Image
      can :geocode, :location
      can :read, User do |u|
        user.id == u.id
      end
    else
      # guest user aka. anonymous
      can :read, Place
      can :search, Place
      can :read, Farm
      can :read, Depot
      can :read, Image
    end
  end
end
