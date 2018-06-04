export const ENTRY_ATTRIBUTES = [
  'id',
  'name',
  'city',
  'address',
  'latitude',
  'longitude'
]

export const PLACE_ATTRIBUTES = ENTRY_ATTRIBUTES.concat([
  'vegetable_products',
  'animal_products',
  'beverages',
  'type'
])

export const PLACE_DETAILS_ATTRIBUTES = PLACE_ATTRIBUTES.concat([
  'url',
  'founded_at_year',
  'founded_at_month',
  'maximum_members',
  'additional_product_information',
  'participation',
  'acts_ecological',
  'economical_behavior',
  'contact_function'
])

export const DEPOT_ATTRIBUTES = ENTRY_ATTRIBUTES.concat([
  'vegetable_products',
  'animal_products',
  'beverages',
  'accepts_new_members',
  'description',
  'updated_at',
  'type'
])

export const DEPOT_DETAILS_ATTRIBUTES = DEPOT_ATTRIBUTES.concat([
  'url',
  'delivery_days'
])

export const FARM_ATTRIBUTES = ENTRY_ATTRIBUTES.concat([
  'vegetable_products',
  'animal_products',
  'beverages',
  'accepts_new_members',
  'description',
  'updated_at',
  'type'
])

export const FARM_DETAILS_ATTRIBUTES = FARM_ATTRIBUTES.concat([
  'url',
  'founded_at_year',
  'founded_at_month',
  'maximum_members',
  'additional_product_information',
  'participation',
  'acts_ecological',
  'economical_behavior',
  'contact_function'
])

export const INITIATIVE_ATTRIBUTES = ENTRY_ATTRIBUTES.concat([
  'description',
  'updated_at',
  'type'
])

export const INITIATIVE_DETAILS_ATTRIBUTES = INITIATIVE_ATTRIBUTES.concat([
  'url'
])

export const DEPOT_TYPE = 'Depot'
export const FARM_TYPE = 'Farm'
export const INITIATIVE_TYPE = 'Initiative'
