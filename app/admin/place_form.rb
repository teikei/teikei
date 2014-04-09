module PlaceForm
  @place_form = Proc.new do |f|
    f.inputs "Name and Description" do
      f.input :name
      f.input :description
      f.input :is_established
    end
    f.inputs "Location" do
      f.input :city
      f.input :address
      f.input :latitude
      f.input :longitude
    end
  end

  def self.form(f)
    @place_form.call(f)
  end
end
