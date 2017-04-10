class AddColumnInitiativeGoalsToPlaces < ActiveRecord::Migration
  def up
    add_column :places, :initiative_goals, :integer

  end

  def down
    remove_column :places, :initiative_goals
  end
end
