class RemoveColumnIsSolawiMemberFromPlaces < ActiveRecord::Migration
  def up
    remove_column :places, :is_solawi_member
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Unable to restore the membership information."
  end
end
