class Farm < ActiveRecord::Base
  attr_accessible :location, :name
  belongs_to :user
  resourcify
end
