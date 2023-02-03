import createFeathersClient from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import { EntryType } from "./store";

const TYPE_TO_SERVICE_MAPPING = {
  Depot: "depots",
  Farm: "farms",
  Initiative: "initiatives",
};

const typeToService = (type: EntryType) => {
  const serviceName = TYPE_TO_SERVICE_MAPPING[type];
  if (serviceName === undefined) {
    throw new Error(`invalid type ${type} requested.`);
  }
  return serviceName;
};

const app = createFeathersClient();
const restClient = rest("http://localhost:3030");
app.configure(restClient.fetch(window.fetch.bind(window)));

export const findEntries = async () => app.service("entries").find();
export const getEntry = async (type: EntryType | null, id: number | null) => {
  if (type === null || id === null) {
    return null;
  }
  return app.service(typeToService(type)).get(id);
};
