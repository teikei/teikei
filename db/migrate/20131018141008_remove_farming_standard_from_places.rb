class RemoveFarmingStandardFromPlaces < ActiveRecord::Migration
  def up
    remove_column :places, :farming_standard
  end

  def down
    raise ActiveRecord::IrreversibleMigration, 'Unable to restore information about farming standard.'
  end
end
