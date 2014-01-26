class MultiplePlaceOwners < ActiveRecord::Migration
  def up
    create_table :ownerships do |t|
      t.integer :place_id
      t.integer :user_id
    end
    add_index :ownerships, [:place_id, :user_id]

    Place.find_in_batches do |batch|
      batch.each do |p|
        p.users << User.find(p.user_id)
      end
    end

    remove_column :places, :user_id
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
