import React, { useState } from "react";
import { useMutation } from "react-query";
import { useController } from "react-hook-form";

import { EntryType, LocationSearchResult } from "@/types";
import { geocode } from "@/api";
import { LocationSearchCombobox, PreviewTile } from "@/components/ui";

interface Props {
  entryType?: EntryType;
  initialValue: LocationSearchResult | null;
}

export const GeocoderInput: React.FC<Props> = ({ entryType, initialValue }) => {
  const [locationSearchResult, setLocationSearchResult] =
    useState<LocationSearchResult | null>(initialValue);

  const {
    field: { onChange: onLatitudeChange, value: latitude },
  } = useController({
    name: "latitude",
  });

  const {
    field: { onChange: onLongitudeChange, value: longitude },
  } = useController({
    name: "longitude",
  });

  // TODO get rid of legacy 'address' field in favor of street + postalcode
  const {
    field: { onChange: onAddressChange },
  } = useController({
    name: "address",
  });

  const {
    field: { onChange: onStreetChange },
  } = useController({
    name: "street",
  });

  const {
    field: { onChange: onHousenumberChange },
  } = useController({
    name: "housenumber",
  });

  const {
    field: { onChange: onPostalcodeChange },
  } = useController({
    name: "postalcode",
  });

  const {
    field: { onChange: onCityChange },
  } = useController({
    name: "city",
  });

  const {
    field: { onChange: onStateChange },
  } = useController({
    name: "state",
  });

  const {
    field: { onChange: onCountryChange },
  } = useController({
    name: "country",
  });

  const geocoderMutation = useMutation(["geocode"], geocode, {
    onSuccess: (data) => {
      onCityChange(data.city);
      onLatitudeChange(data.latitude);
      onLongitudeChange(data.longitude);
      onAddressChange([data.street, data.housenumber].join(" ").trim());
      onStreetChange(data.street);
      onHousenumberChange(data.housenumber);
      onPostalcodeChange(data.postalCode);
      onStateChange(data.state);
      onCountryChange(data.country);
    },
  });

  const onSearchResultChange = (
    locationSearchResult: LocationSearchResult | null
  ) => {
    setLocationSearchResult(locationSearchResult);
    if (locationSearchResult && locationSearchResult.id) {
      geocoderMutation.mutate({ locationid: locationSearchResult.id });
    }
  };

  return (
    <>
      <PreviewTile
        entryType={entryType}
        latitude={latitude}
        longitude={longitude}
      />
      <LocationSearchCombobox
        value={locationSearchResult}
        onChange={onSearchResultChange}
        id="geocoder"
        label="Standort"
      />
    </>
  );
};
