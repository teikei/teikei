class AddEcologicalBehaviorToPlaces < ActiveRecord::Migration
  def change
    add_column :places, :acts_ecological, :boolean, default: false
    add_column :places, :economical_behavior, :string
  end
end
