export type EntryType = "Initiative" | "Farm" | "Depot";

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
