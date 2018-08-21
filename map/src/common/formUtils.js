import _ from 'lodash'
import path from 'path'
// import Ajv from 'ajv'
// import compileSchema from 'redux-form-with-ajv'
// import entitySchemas from '@teikei/schemas'
import i18n from '../i18n'
import Joi from 'joi'


// const ajv = new Ajv({
//   allErrors: true,
//   verbose: true
// })
//
// const errorMessage = error => i18n.t(`forms.validation.${error.keyword}`)
//
// const validators = _.mapValues(entitySchemas, schema =>
//   compileSchema(schema, { ajv, errorMessage })
// )
//
// export const validator = name => validators[name]
//
export const dirtyValues = (values, initialValues) =>
  _.transform(values, (result, value, key) => {
    if (!_.isEqual(value, initialValues[key])) {
      result[key] =
        _.isObject(value) && _.isObject(initialValues[key])
          ? dirtyValues(value, initialValues[key])
          : value
    }
  })

const schemas = {
  depot: {
    name: Joi.string()
      .trim()
      .required(),
    city: Joi.string()
      .trim()
      .required(),
    address: Joi.string()
      .trim()
      .required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    farms: Joi.array().items(Joi.number().required(), Joi.number()),
    url: Joi.string()
      .uri()
      .trim(),
    description: Joi.string(),
    deliveryDays: Joi.string()
  }
}

// take a joi schema and create a validator function for redux form
export const validator = schema => {
  return values => {
    const result = Joi.validate(values, schemas[schema], { abortEarly: false })

    if (result.error === null) {
      return {}
    }

    return result.error.details.reduce((all, cur) => {
      const allErrors = Object.assign({}, all)
      const path = cur.path[cur.path.length - 1]
      const message = i18n.t(`joi.${cur.type}`, cur.context)
      console.log("cur.message", cur.message);
      console.log("cur.message", cur.context);

      if (Object.prototype.hasOwnProperty.call(allErrors, path)) {
        allErrors[path] += message
      } else {
        allErrors[path] = message
      }
      return allErrors
    }, {})
  }
}
