class SetInitialBaseurlInUser < ActiveRecord::Migration
  def up
    User.update_all(baseurl: '/map#')
  end

  def down
    remove_column :users, :baseurl
  end
end
