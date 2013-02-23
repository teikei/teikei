class Place < ActiveRecord::Base
  geocoded_by :location
  after_validation :geocode

  attr_accessible :name, :city, :address, :latitude, :longitude,
  :accepts_new_members, :is_established, :description, :contact_name,
  :contact_email, :contact_phone, :type
  belongs_to :user

  has_many :place_connections, foreign_key: :place_a_id, dependent: :destroy
  has_many :places, through: :place_connections, source: :place_b
  has_many :reverse_place_connections, class_name: :PlaceConnection, foreign_key: :place_b_id, dependent: :destroy

  def location
    result = []
    [self.address, self.city].each do |param|
      result << param unless param.blank?
    end
    result.join(' ') unless result.blank?
  end

end
