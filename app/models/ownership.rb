class Ownership < ActiveRecord::Base
  belongs_to :place
  belongs_to :user

  delegate :name, :email, to: :user
end
