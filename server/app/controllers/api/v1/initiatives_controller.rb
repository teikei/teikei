class Api::V1::InitiativesController < Api::V1::BaseController

  def index
    @initiatives = Initiative.all.includes(:users).includes(:goals)
  end

  def create
    @initiative.goals = Goal.where(key: params[:goal_keys])
    @initiative.users = [current_user] if current_user
    expire_fragment('initiatives_index')
    create!
  end

  def update
    @initiative.goals = Goal.where(key: params[:goal_keys])
    expire_fragment('initiatives_index')
    update!
  end
end
