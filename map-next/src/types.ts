import { Feature, FeatureCollection, Point } from "geojson";

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

interface EntryProperties {
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

interface FarmProperties {
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
}

interface DepotProperties {
  deliveryDays: string;
  farms: FeatureCollection<Point, EntryProperties & FarmProperties>;
}

interface InitiativeProperties {
  goals: Goal[];
  badges: Badge[];
}

export type Entry = Feature<Point, EntryProperties>;
export type DetailedEntry = Farm | Depot | Initiative;
export type Farm = Feature<Point, EntryProperties & FarmProperties>;
export type Depot = Feature<Point, EntryProperties & DepotProperties>;
export type Initiative = Feature<Point, EntryProperties & InitiativeProperties>;
