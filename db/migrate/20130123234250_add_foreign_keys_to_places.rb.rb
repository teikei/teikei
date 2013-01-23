class AddForeignKeysToPlaces < ActiveRecord::Migration
  def change
    add_foreign_key(:farms, :places, dependent: :delete)
    add_foreign_key(:depots, :places, dependent: :delete)
    add_foreign_key(:places, :users)
  end
end
