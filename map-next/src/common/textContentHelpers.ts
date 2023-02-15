import { AcceptsNewMembersType } from "../types";

const getMonthName = (month: number) => {
  const objDate = new Date();
  objDate.setDate(1);
  objDate.setMonth(month);
  return objDate.toLocaleString("de-DE", { month: "long" });
};

const temporalConnectionWord = (year: number, month: number) => {
  const foundedAt = new Date(year, month);
  const today = new Date();
  const inThePast = foundedAt < today;
  return inThePast ? "seit" : "ab";
};

const ACCEPTS_NEW_MEMBERS_MAPPING: { [key in AcceptsNewMembersType]: string } =
  {
    yes: "Wir nehmen neue Mitglieder auf!",
    no: " Wir nehmen derzeit keine neuen Mitglieder auf!",
    waitlist: "Wir nehmen neue Mitglieder auf! (Warteliste)",
  };

export const foundedAtText = (year: number, month: number) => {
  const since = temporalConnectionWord(year, month - 1);
  const foundedAtMonthText = getMonthName(month - 1);
  return `Solidarische Landwirtschaft ${since} ${foundedAtMonthText} ${year}`;
};

export const membershipInfoText = (acceptsNewMembers: AcceptsNewMembersType) =>
  ACCEPTS_NEW_MEMBERS_MAPPING[acceptsNewMembers];
