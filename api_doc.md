# Teikei API Reference

## Sessions (Login / Logout)

- POST /api/v1/sessions
   create a new session (login)
   data : username / password
   success: 200

   curl -X POST -i http://localhost:3000/api/v1/sessions.json -d "user[email]=admin@example.com&user[password]=password"


- DELETE /api/v1/sessions/:ID
   destroy the session (logout)
   data : -
   success: 204

   curl -X DELETE -i http://localhost:3000/api/v1/sessions/1.json

## Places

- GET /api/v1/places
   return all places (i.e. depots and farms combined)
   data  : -
   success : 200

   curl -X GET http://localhost:3000/api/v1/places.json


## Farms

- GET /api/v1/farms
    return all farms
    data  : -
    success : 200

    curl -X GET http://localhost:3000/api/v1/farms.json

- GET /api/v1/farms/:ID
    return a single farm
    data  : -
    success : 200

      curl -X GET http://localhost:3000/api/v1/farms/1.json

- POST /api/v1/farms
    create a new farm
    data  : farm[attribute], token
    success : 201

    curl -X POST http://localhost:3000/api/v1/farms.json -d "farm[name]=Foo&auth_token=CumRN7eWgoVZfAa2fQzG"

- PUT /api/v1/farms/:ID
    update a farm
    data  : farm[attribute], token
    success : 204

    curl -X PUT http://localhost:3000/api/v1/farms/1.json -d "farm[name]=Foo&auth_token=CumRN7eWgoVZfAa2fQzG"

- DELETE /api/v1/farms/:ID
    delete a farm
    data  : -
    success : 204

    curl -X DELETE http://localhost:3000/api/v1/farms/1.json -d "auth_token=CumRN7eWgoVZfAa2fQzG"

## Depots

- GET /api/v1/depots
    return all depots
    data  : -
    success : 200

    curl -X GET http://localhost:3000/api/v1/depots.json

- GET /api/v1/depots/:ID
    return a single depot
    data  : -
    success : 200

    curl -X GET http://localhost:3000/api/v1/depots/1.json

- POST /api/v1/depots
    create a new depot
    data  : depot[attribute], token
    success : 201

    curl -X POST http://localhost:3000/api/v1/depots.json -d "depot[name]=Foo&auth_token=CumRN7eWgoVZfAa2fQzG"

- PUT /api/v1/depots/:ID
    update a depot
    data  : depot[attribute], token
    success : 204

    curl -X PUT http://localhost:3000/api/v1/depots/1.json -d "depot[name]=Foo&auth_token=CumRN7eWgoVZfAa2fQzG"

- DELETE /api/v1/depots/:ID
    delete a depot
    data  : -
    success : 204

    curl -X DELETE http://localhost:3000/api/v1/depots/1.json -d "auth_token=CumRN7eWgoVZfAa2fQzG"
