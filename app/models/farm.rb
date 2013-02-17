class Farm < ActiveRecord::Base
  inherits_from :place
  resourcify
end
