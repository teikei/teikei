class CreatePlaces < ActiveRecord::Migration
  def change
    create_table :places do |t|
      t.string :name
      t.string :address
      t.string :city
      t.decimal :latitude, precision: 15, scale: 10
      t.decimal :longitude, precision: 15, scale: 10
      t.string :accepts_new_members, default: 'yes'
      t.boolean :is_established, default: true
      t.text :description
      t.string :contact_name
      t.string :contact_email
      t.string :contact_phone

      t.date :founded_at
      t.integer :maximum_members
      t.text :products
      t.string :farming_standard
      t.text :participation
      t.boolean :is_solawi_member, default: false

      t.string :type
      t.integer :user_id

      t.timestamps
    end
  end
end
