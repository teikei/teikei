class CreateDepots < ActiveRecord::Migration
  def change
    create_table :depots, inherits: :place do |t|
      t.timestamps
    end
  end
end
