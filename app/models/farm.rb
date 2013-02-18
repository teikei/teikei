class Farm < Place

  #
  # Attribute Handlers
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  attr_accessible :founded_at, :maximum_members,
  :products, :farming_standard, :participation

  #
  # Constants
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Settings
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Plugins
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  resourcify

  #
  # Scopes
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Associations
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Nested Attributes
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Validations
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Callbacks
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Instance Methods
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  def aggregated_places
    neighbors = self.places
    neighbors.each do |neighbor|
      # Inheritance fails here!
      # if neighbor.is_a?(Farm)
      if neighbor.subtype == "Farm"
        neighbor.places.each do |potential_depot|
          # Inheritance works here?!
          if potential_depot.is_a?(Depot)
          # subtype runs into an error with .place
          # if potential_depot.subtype == "Depot"
            # puts potential_depot.to_yaml
            neighbors << potential_depot.place
          end
        end
      end
    end
    neighbors.uniq
  end

  #
  # Class Methods
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

  #
  # Protected
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

protected

  #
  # Private
  # ---------------------------------------------------------------------------------------
  #
  #
  #
  #

private


end

