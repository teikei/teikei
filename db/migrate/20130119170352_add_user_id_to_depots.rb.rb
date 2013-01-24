class AddUserIdToDepots < ActiveRecord::Migration
  def change
    add_column :depots, :user_id, :integer
    add_foreign_key(:depots, :users)
  end
end
