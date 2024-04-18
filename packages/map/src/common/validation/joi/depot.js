import Joi from "joi-browser"

import { entryDetails, entryInitialValues } from "./entry"

export const depotSchema = {
  ...entryDetails,
  farms: Joi.array().items(Joi.number().required(), Joi.number()),
  deliveryDays: Joi.string().max(255).allow("").allow(null), // legacy,
}

export const depotInitialValues = {
  ...entryInitialValues,
  farms: [],
  deliveryDays: "",
}
