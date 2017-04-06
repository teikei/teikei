class AddBaseurlToUser < ActiveRecord::Migration
  def up
    add_column :users, :baseurl, :string
    User.update_all(origin: '/map#')
  end

  def down
    remove_column :users, :baseurl
  end
end
