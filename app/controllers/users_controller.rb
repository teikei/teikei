class UsersController < InheritedResources::Base
  respond_to :html, :json
  actions :index, :show, :update, :destroy
  before_filter :authenticate_user!

  def index
    authorize! :index, @user, :message => 'Not authorized as an administrator.'
    index!
  end

  def update
    authorize! :update, @user, :message => 'Not authorized as an administrator.'
    update!
  end

  def destroy
    authorize! :destroy, @user, :message => 'Not authorized as an administrator.'
    destroy!
  end
end
