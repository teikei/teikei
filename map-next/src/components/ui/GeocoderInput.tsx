import React, { useState } from "react";
import { useMutation } from "react-query";
import { geocode } from "@/api";
import { useController } from "react-hook-form";
import classNames from "classnames";

import { useConfig } from "@/clients";
import { EntryType, LocationSearchResult } from "@/types";
import { LocationSearchCombobox } from "@/components/ui";

const PREVIEW_TILE_WIDTH = "600";
const PREVIEW_TILE_HEIGHT = "240";
const PREVIEW_TILE_ZOOM_LEVEL = "14";

const tileUrl = (
  assetsBaseUrl: string,
  mapStaticUrl: string,
  latitude?: number,
  longitude?: number
) => {
  if (!latitude || !longitude) {
    return `url(${assetsBaseUrl}/placeimage-placeholder.png)`;
  }
  return `url(${mapStaticUrl})`
    .replace("{zoom}", PREVIEW_TILE_ZOOM_LEVEL)
    .replace("{width}", PREVIEW_TILE_WIDTH)
    .replace("{height}", PREVIEW_TILE_HEIGHT)
    .replace("{lat}", latitude.toString())
    .replace("{lon}", longitude.toString());
};

const markerUrl = (assetsBaseUrl: string, markerIcon?: string) => {
  if (!markerIcon) {
    return "";
  }
  return `${assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`;
};

interface Props {
  entryType?: EntryType;
}

export const GeocoderInput: React.FC<Props> = ({ entryType }) => {
  const { assetsBaseUrl, mapStaticUrl } = useConfig();

  const [locationSearchResult, setLocationSearchResult] =
    useState<LocationSearchResult | null>(null);

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
      <div
        className="relative h-[240px] mb-1 bg-gray-500 bg-center bg-no-repeat"
        style={{
          backgroundImage: tileUrl(
            assetsBaseUrl,
            mapStaticUrl,
            latitude,
            longitude
          ),
        }}
      >
        <img
          className={classNames(
            "absolute left-1/2 top-1/2 w-[47px] ml-[-25px] mt-[-57px]",
            { block: entryType, hidden: !entryType }
          )}
          src={markerUrl(assetsBaseUrl, entryType)}
          alt="Index Marker Icon"
        />
      </div>
      <LocationSearchCombobox
        value={locationSearchResult}
        onChange={onSearchResultChange}
        id="geocoder"
        label="Standort"
      />
    </>
  );
};
