# account-management Specification

## Purpose

Defines which self-service account actions the API accepts for sign-up verification, password reset and password change, how it answers them, and which account data its responses may contain.

## Requirements

### Requirement: Accepted account actions

The `authManagement` endpoint SHALL accept exactly four actions: `verifySignupLong`, `sendResetPwd`, `resetPwdLong` and `passwordChange`. The request body shapes and the success responses for these actions SHALL stay the same as before this change.

#### Scenario: Sign-up verification with a valid token

- **WHEN** a guest posts `{ action: 'verifySignupLong', value: <token> }` with the token from the confirmation email of an unverified account
- **THEN** the account becomes verified and the response is a success

#### Scenario: Password reset with a valid token

- **WHEN** a guest posts `{ action: 'resetPwdLong', value: { token, password } }` with the token from a reset email
- **THEN** the account's password is replaced and the user can sign in with the new password

#### Scenario: Password change by the signed-in user

- **WHEN** an authenticated user posts `{ action: 'passwordChange', value: { user: { email }, oldPassword, password } }` with their current password
- **THEN** the password is changed and the user can sign in with the new password

### Requirement: Other account actions are rejected

The endpoint SHALL reject every other action, including a missing action, with `400 BadRequest`, without reading or changing any account and without sending email. This covers `checkUnique`, `resendVerifySignup`, `identityChange`, `verifySignupShort`, `verifySignupSetPasswordLong`, `verifySignupSetPasswordShort`, `resetPwdShort` and `options`.

#### Scenario: Email uniqueness check

- **WHEN** a guest posts `{ action: 'checkUnique', value: { email } }`, whether or not an account with that email exists
- **THEN** the response is `400 BadRequest`, identical for both cases

#### Scenario: Resending the verification email

- **WHEN** a guest posts `{ action: 'resendVerifySignup', value: { email } }` for an existing unverified account
- **THEN** the response is `400 BadRequest` and no email is sent

#### Scenario: Reading the library options

- **WHEN** a client posts `{ action: 'options' }`
- **THEN** the response is `400 BadRequest` and contains no configuration

### Requirement: Password reset requests do not reveal accounts

A `sendResetPwd` request SHALL return the same empty success response whether the email belongs to a verified account, an unverified account or no account. The reset email SHALL be sent only for a verified account.

#### Scenario: Unknown email

- **WHEN** a guest requests a password reset for an email without an account
- **THEN** the response is `{}` and no email is sent

#### Scenario: Verified account

- **WHEN** a guest requests a password reset for a verified account's email
- **THEN** the response is `{}` and the account receives a reset email

### Requirement: Password change requires authentication

A `passwordChange` request without a valid access token SHALL be rejected with `401 NotAuthenticated`, and the password SHALL stay unchanged.

#### Scenario: Guest attempts a password change

- **WHEN** a guest posts a `passwordChange` action without an `Authorization` header
- **THEN** the response is `401 NotAuthenticated`

### Requirement: Account action failures carry error codes

Failures of the accepted actions SHALL carry the same `data.errorCode` values as before this change, so clients can tell an invalid from an expired token and a reset token from a verification token.

#### Scenario: Unknown verification token

- **WHEN** a guest posts `verifySignupLong` with a token that matches no account
- **THEN** the response is `400 BadRequest` with `data.errorCode` `USER_NOT_FOUND`

#### Scenario: Expired verification token

- **WHEN** a guest posts `verifySignupLong` with the token of an unverified account whose verification has expired
- **THEN** the response is `400 BadRequest` with `data.errorCode` `VERIFICATION_TOKEN_EXPIRED`

#### Scenario: Wrong current password

- **WHEN** an authenticated user posts `passwordChange` with a wrong `oldPassword`
- **THEN** the response is an error with `data.errorCode` `CURRENT_PASSWORD_INCORRECT`

### Requirement: New accounts get the user role

Sign-up SHALL create the account and assign it the `user` role together: an account SHALL NOT exist without that role. A sign-up whose role assignment fails SHALL leave no account behind.

#### Scenario: Sign-up

- **WHEN** a guest signs up and later verifies the account and signs in
- **THEN** the access token's `roles` contain exactly the `user` role

### Requirement: Responses never expose account secrets

No external response of `users`, `admin/users`, `authentication`, `authManagement`, `user-reactivation` or `admin/bounces` SHALL contain `password`, `reactivationToken` or any `verify*` or `reset*` token field, including in nested records.

#### Scenario: Sign-up response

- **WHEN** a guest signs up
- **THEN** the response contains none of these fields, nor `origin` or `baseurl`

#### Scenario: Reading one's own account

- **WHEN** an authenticated user reads `users/<own id>`
- **THEN** the response contains none of these fields

#### Scenario: Admin user list with details

- **WHEN** a superadmin lists `admin/users` with `$details=true`
- **THEN** no user record contains any of these fields

### Requirement: Account records stay private

The `users` endpoint SHALL reject external `find`, `update` and `remove` with `405 MethodNotAllowed`, and SHALL reject an external `get` of another user's account with `403 Forbidden` and `data.errorCode` `FORBIDDEN`.

#### Scenario: Listing accounts

- **WHEN** any client sends `GET /users`
- **THEN** the response is `405 MethodNotAllowed`

#### Scenario: Reading another account

- **WHEN** an authenticated user reads `users/<another user's id>`
- **THEN** the response is `403 Forbidden` with `data.errorCode` `FORBIDDEN`
