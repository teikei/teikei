class AddUserIdToFarm < ActiveRecord::Migration
  def change
    add_column :farms, :user_id, :integer
    add_foreign_key(:farms, :users)
  end
end
