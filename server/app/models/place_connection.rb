class PlaceConnection < ActiveRecord::Base
  belongs_to :place_a, class_name: :Place
  belongs_to :place_b, class_name: :Place
end
