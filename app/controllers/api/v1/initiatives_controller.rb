class Api::V1::InitiativesController < Api::V1::BaseController

  def index
    @initiatives = Initiative.all.includes(:users)
  end

  def create
    @initiative.users = [current_user] if current_user
    expire_fragment('initiatives_index')
    create!
  end

  def update
    expire_fragment('initiatives_index')
    update!
  end

end
