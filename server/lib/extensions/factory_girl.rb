module FactoryBot
  def self.accessible_attributes_for(*args)
    build_object = FactoryBot.build(*args)
    build_object.attributes.slice(*build_object.class.accessible_attributes).symbolize_keys
  end
end
