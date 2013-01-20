class Ability
  include CanCan::Ability

  def initialize(user)
    # Create guest user aka. anonymous (not logged-in) when user is nil.
    user ||= User.new

    if user.has_role? :admin
      can :manage, :all
    elsif user.has_role? :user
      can :manage, Farm, user_id: user.id
      can :create, Farm
      can :manage, Depot, user_id: user.id
      can :create, Depot
      can :read, :all
    else
       # guest user aka. anonymous
      can :read, :all
    end
  end
end
