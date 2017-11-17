class AddDeliveryDaysToPlaces < ActiveRecord::Migration
  def change
    add_column :places, :delivery_days, :text
  end
end
