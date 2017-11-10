class CreateJoinTableInitiativeGoals < ActiveRecord::Migration
  def change
    create_join_table :initiatives, :goals do |t|
      t.index [:initiative_id, :goal_id]
      t.index [:goal_id, :initiative_id]
    end
  end
end
