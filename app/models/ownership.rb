class Ownership < ActiveRecord::Base
  belongs_to :place
  belongs_to :user

  delegate :name, :email, :phone, to: :user
end
