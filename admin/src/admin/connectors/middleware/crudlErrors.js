/* eslint-disable no-underscore-dangle,no-param-reassign */
/** middleware to transfrom express errors to crudl errors */
export default function crudlErrors(next) {
  function transformErrors(error) {
    if (error !== null && typeof error === 'object') {
      if (error.__all__) {
        error._error = error.__all__
      }
    }
    return error
  }

  function processError(response) {
    switch (response.status) {
      case 400:
        throw new Error({
          validationError: true,
          errors: transformErrors(response.data)
        })
      case 401:
        throw new Error({ authorizationError: true })
      case 403:
        throw new Error({ permissionError: true })
      default:
        throw new Error({ message: response.statusText })
    }
  }

  return {
    create: req => next.create(req).catch(processError),
    read: req => next.read(req).catch(processError),
    update: req => next.update(req).catch(processError),
    delete: req => next.delete(req).catch(processError)
  }
}
