class HomeController < InheritedResources::Base
  respond_to :html, :json
  actions :index
  defaults resource_class: User, collection_name: 'users', instance_name: 'user'

  def index
    @intro_block = TextBlock.block_for('start_intro', I18n.locale)
    @howitworks_block = TextBlock.block_for('start_howitworks', I18n.locale)
  end

  def map
    @layout_hide_header = true
  end

end
