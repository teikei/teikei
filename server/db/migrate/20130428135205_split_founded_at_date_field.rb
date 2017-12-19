class SplitFoundedAtDateField < ActiveRecord::Migration
  def up
    add_column :places, :founded_at_year, :integer
    add_column :places, :founded_at_month, :integer
    Farm.find_each do |f|
      f.founded_at_year = f.founded_at.year
      f.founded_at_month = f.founded_at.month
      f.save!
    end
    remove_column :places, :founded_at
  end

  def down
    raise ActiveRecord::IrreversibleMigration, 'Unable to restore the full dates from partial dates.'
  end
end
