class DropColumnIsEstablishedFromPlaces < ActiveRecord::Migration
  def change
    if column_exists? :places, :is_established
      remove_column :places, :is_established
    end
  end
end
