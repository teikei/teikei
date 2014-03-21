class DropColumnsEmailNameFromPlace < ActiveRecord::Migration
  def up
    Place.all.each do |p|
      u = p.ownerships.first.user
      if u.name != p.contact_name
        say("error: user #{u.name} has entered #{p.contact_name} as contact name for place #{p.name}")
        raise "migration aborted\n"
      end
      if u.email != p.contact_email
        say("error: user #{u.name} has entered #{p.contact_email} as contact email for place #{p.name}")
        raise "migration aborted\n"
      end
    end
    say "no inconsistencies found, dropping place columns"
    remove_column :places, :contact_name
    remove_column :places, :contact_email
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
