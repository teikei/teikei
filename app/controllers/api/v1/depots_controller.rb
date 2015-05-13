class Api::V1::DepotsController < Api::V1::BaseController

  before_filter :assign_places, only: [:create, :update]

  def index
    @depots = Depot.all.includes(:places).includes(:reverse_places).includes(:users)
    @depots
  end

  def create
    @depot.users = [current_user] if current_user
    create!
  end

  def update
    update!
  end


  private

  def assign_places
    raise ArgumentError, "Missing 'places' argument." unless params.has_key?(:places)
    places_params = params[:places]
    if places_params
      replace_all_places_associations(places_params)
    else
      remove_all_places_associations
    end
  end

  def replace_all_places_associations(places_params)
    place_ids = extract_place_ids(places_params)
    @depot.places = Place.find(place_ids)
  end

  def extract_place_ids(places_params)
    if places_params[0].is_a? Hash
      return places_params.map { |p| p[:id].to_i }
    elsif places_params[0].is_a? String # Used by Select2 sending farms ids as a JSON string.
      return places_params
    else
      raise ArgumentError, "Argument 'places' contains #{places_params[0].class} objects."
    end
  end

  def remove_all_places_associations
    @depot.places = []
  end


end
