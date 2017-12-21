class Role < ActiveRecord::Base
  scopify

  before_save do
    self.resource_type = nil
    self.resource_id = nil
  end

  has_and_belongs_to_many :users, :join_table => :users_roles
  belongs_to :resource, :polymorphic => true
end
