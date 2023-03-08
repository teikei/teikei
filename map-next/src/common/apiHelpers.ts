import { EntryType } from "@/types";

export const typeToService = (type: EntryType) => {
  const TYPE_TO_SERVICE_MAPPING = {
    Depot: "depots",
    Farm: "farms",
    Initiative: "initiatives",
  };
  const serviceName = TYPE_TO_SERVICE_MAPPING[type];
  if (serviceName === undefined) {
    throw new Error(`invalid type ${type} requested.`);
  }
  return serviceName;
};
