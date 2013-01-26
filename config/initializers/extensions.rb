Dir.glob("#{Rails.root}/lib/extensions/*").each { |f| require f }
