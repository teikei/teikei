class FixSuperadminRole < ActiveRecord::Migration
  def change
    update "UPDATE roles SET resource_id = null, resource_type = null WHERE name = 'superadmin'"
  end
end
