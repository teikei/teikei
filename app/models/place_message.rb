class PlaceMessage < ContactMessage
  attr_accessor :place_id

  validates :place_id, presence: true
end
