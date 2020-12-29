#!/bin/sh
git push dokku-teikei-map
git push dokku-teikei-api
git push dokku-teikei-admin
git push dokku-teikei-map-preview preview:master
git push dokku-teikei-api-preview preview:master
git push dokku-teikei-admin-preview preview:master
