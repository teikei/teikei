class Depot < ActiveRecord::Base
  attr_accessible :location, :name, :lat, :lng
  belongs_to :user
  resourcify
end
