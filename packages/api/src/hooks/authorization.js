import { jwtDecode } from "jwt-decode"
import { Forbidden } from "@feathersjs/errors"
import _ from "lodash"
import permissions from "../permissions"

const extractRolesFromJwtToken = (ctx) => {
  if (ctx.params.headers && ctx.params.headers.authorization) {
    return jwtDecode(ctx.params.headers.authorization).roles.map((r) => r.name)
  }
  if (ctx.result && ctx.result.accessToken) {
    return jwtDecode(ctx.result.accessToken).roles.map((r) => r.name)
  }
  return []
}

const resolveMethod = (method) => {
  switch (method) {
    case "find":
    case "get":
      return "read"
    case "patch":
      return "update"
    case "create":
      return "create"
    case "remove":
      return "delete"
  }
}

const getMaximumAccessRole = (roles) => {
  if (roles.includes("superadmin")) {
    return "superadmin"
  } else if (roles.includes("admin")) {
    return "admin"
  } else if (roles.includes("user")) {
    return "user"
  } else {
    return "guest"
  }
}

const getScopeFor = (roles, service, method) => {
  const resolvedMethod = resolveMethod(method)
  const maxRole = getMaximumAccessRole(roles)
  return permissions[maxRole].find(
    (s) => s.scope === `${service}:${resolvedMethod}`,
  )
}

const fetchResource = async (service, serviceName, id) => {
  const eager = ["farms", "depots", "initiatives"].includes(serviceName)
    ? ["ownerships"]
    : []
  return service.get(id, {
    query: { $eager: `[${eager.join(",")}]` },
    provider: null,
  })
}

export const authorize = async (ctx) => {
  const { method, service, path: serviceName } = ctx

  const roles = extractRolesFromJwtToken(ctx)

  const scope = getScopeFor(roles, serviceName, method)

  if (!scope) {
    throw new Forbidden(`You are not allowed to ${method} ${serviceName}.`)
  }

  let resource
  if (ctx.id && (scope.condition || scope.fields)) {
    resource = await fetchResource(service, serviceName, ctx.id)
  }

  const currentUserId = ctx.params.user && ctx.params.user.id

  if (scope.condition) {
    if (!scope.condition(currentUserId, resource)) {
      throw new Forbidden(`You are not allowed to ${method} ${serviceName}.`)
    }
  }

  if (scope.fields) {
    const allowedFields = scope.fields(currentUserId, resource)
    ctx.allowedFields = allowedFields
    const forbiddenFields = _.keys(
      _.pickBy(ctx.data, (value, key) => !allowedFields.includes(key)),
    )
    if (forbiddenFields.length > 0) {
      throw new Forbidden(
        `You are not allowed to write fields ${forbiddenFields} of ${serviceName}`,
      )
    }
  }

  return ctx
}
