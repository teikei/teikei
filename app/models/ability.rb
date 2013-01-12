class Ability
  include CanCan::Ability

  def initialize(user)
    # Create guest user aka. anonymous (not logged-in) when user is nil.
    user ||= User.new

    if user.has_role? :admin
      can :manage, :all
    else
      # logged in user
      if user.has_role? :user
        can :manage, Farm, :user_id => user.id
        can :create, Farm
      end
       # guest user aka. anonymous
      can :read, :all
    end



    # guest user (not logged in)
    # if user.has_role? :admin
    #   can :manage, :all
    # end
    # if user.has_role? :user
    #   can :manage, Farm
    # else
    #   can :read, Farm
    # end
    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user permission to do.
    # If you pass :manage it will apply to every action. Other common actions here are
    # :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on. If you pass
    # :all it will apply to every resource. Otherwise pass a Ruby class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details: https://github.com/ryanb/cancan/wiki/Defining-Abilities
  end
end
