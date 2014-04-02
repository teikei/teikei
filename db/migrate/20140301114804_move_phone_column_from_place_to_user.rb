class MovePhoneColumnFromPlaceToUser < ActiveRecord::Migration
  def up
    User.all.each do |u|
      phones = u.places.pluck(:contact_phone)
      next if phones.empty?
      unless phones.uniq == [phones.first]
        say("error: user #{u.name} has entered different phone numbers in places:")
        say("#{phones}")
        raise "migration aborted\n"
      end
    end
    add_column :users, :phone, :string
    User.all.each do |u|
      if u.places.length > 0
        u.phone = u.places.first.contact_phone
      end
    end
    remove_column :places, :contact_phone
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
