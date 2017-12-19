class AddOriginToUser < ActiveRecord::Migration
  def up
    add_column :users, :origin, :string
    User.update_all(origin: 'https://ernte-teilen.org')
  end

  def down
    remove_column :users, :origin
  end
end
