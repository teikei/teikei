import React from "react";

import { SelectInput } from "@/components/ui/SelectInput";

const monthNameFormatter = new Intl.DateTimeFormat("de", { month: "long" });
const currentYear = new Date().getFullYear();

const monthOptions = Array(12)
  .fill(0)
  .map((element, index) => index + 1)
  .map((value) => ({
    value: String(value),
    label: monthNameFormatter.format(new Date().setMonth(value - 1)),
  }));

const yearOptions = new Array(100)
  .fill(undefined)
  .reverse()
  .map((val, i) => {
    const year = currentYear - i;
    return { value: year, label: String(year) };
  });

interface Props {
  monthFieldName: string;
  yearFieldName: string;
}

export const MonthPicker: React.FC<Props> = ({
  monthFieldName,
  yearFieldName,
}) => (
  <div className="flex flex-row gap-x-5 w-1/2">
    <SelectInput name={monthFieldName} label="Monat" options={monthOptions} />
    <SelectInput name={yearFieldName} label="Jahr" options={yearOptions} />
  </div>
);
