import { Entry, LocationSearchResult } from "@/types";

export const getLocationSearchInitialValue = (
  entry: Entry | undefined
): LocationSearchResult | null => {
  if (entry === undefined) {
    return null;
  }
  const { street, postalcode, city, state } = entry.properties;
  return {
    street,
    // TODO housenumber
    // TODO typing mismatch entry api/geocoder
    // TDODO why doesn't LocationSearchResult include country?
    postalCode: postalcode,
    city,
    state,
  };
};
