import { Feature, FeatureCollection, Point } from "geojson";
import { LatLngExpression } from "leaflet";

export interface Configuration {
  country: string;
  countries: {
    DE: {
      center: LatLngExpression;
      zoom: number;
    };
    CH: {
      center: LatLngExpression;
      zoom: number;
    };
    AT: {
      center: LatLngExpression;
      zoom: number;
    };
  };
  padding: LatLngExpression;
  zoom: {
    default: number;
    min: number;
    max: number;
    searchResult: number;
  };
  mapToken: string;
  mapStyle: string;
  mapStaticUrl: string;
  baseUrl: string;
  apiBaseUrl: string;
  assetsBaseUrl: string;
  externalHelpUrl: string;
}

export type EntryType = "Initiative" | "Farm" | "Depot";
export type AcceptsNewMembersType = "yes" | "no" | "waitlist";

export interface User {
  email: string;
  id: string;
  name: string;
  phone: string;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  type: string;
  link: string;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  link: string;
}

export interface Badge {
  id: string;
  category: string;
  name: string;
  url: string;
  logo: string;
}

export interface EntryProperties {
  id: number;
  type: EntryType;
  name: string;
  city: string;
  address: string;
  street: string;
  housenumber: string;
  postalcode: string;
  state: string;
  country: string;
  url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type FarmProperties = EntryProperties & {
  acceptsNewMembers: AcceptsNewMembersType;
  foundedAtYear: number;
  foundedAtMonth: number;
  maximumMembers: number;
  additionalProductInformation: string;
  participation: string;
  actsEcological: boolean;
  economicalBehavior: string;
  depots: FeatureCollection<Point, EntryProperties & DepotProperties>;
  products: Product[];
  badges: Badge[];
};

export type DepotProperties = EntryProperties & {
  deliveryDays: string;
  farms: FeatureCollection<Point, FarmProperties>;
};

export type InitiativeProperties = EntryProperties & {
  goals: Goal[];
  badges: Badge[];
};

export type Entry = Feature<Point, EntryProperties>;
export type DetailedEntry = Farm | Depot | Initiative;
export type Farm = Feature<Point, FarmProperties>;
export type Depot = Feature<Point, DepotProperties>;
export type Initiative = Feature<Point, InitiativeProperties>;

export type LocationSearchResult = {
  id?: string;
  street: string;
  // TODO housenumber
  postalCode: string;
  city: string;
  state: string;
};
