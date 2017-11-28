#!/usr/bin/env bash

function usage() {
    echo "teikei"
    echo
    echo "ernte teilen:"
    echo "$0 dev          - run in development mode"
    echo "$0 lint         - lint javascript code"
    echo
    echo "$0 build        - build locally to run the app in production mode"
    echo "$0 prod         - run locally in production mode"
    echo "$0 clean        - cleanup local production build files"
    echo
    echo "emails:"
    echo "$0 dev-emails   - run email development mode"
}

if [[ $# != 1 ]] ; then
    usage
    exit 1
fi

case $1 in
    dev)
    cd client
    yarn install
    cd ..
    $0 build_emails
    cd server
    bundle install
    bundle exec foreman start --procfile Procfile-dev -d ..
    ;;

    clean)
    echo "cleaning client..."
    cd client
    rm -rf build
    rm -rf node_modules
    cd ..
    echo "cleaning emails..."
    cd emails
    rm -rf dist
    rm -rf node_modules
    cd ..
    echo "cleaning server..."
    cd server
    bundle exec rake assets:clobber
    rm -rf public/static
    rm app/assets/javascripts/site.js app/assets/javascripts/map.js
    rm app/assets/stylesheets/site.css app/assets/stylesheets/map.css
    rm app/views/app_mailer/*
    ;;

    build_client)
    echo "building client locally..."
    cd client
    yarn install
    NODE_ENV=production npm run build
    cd ..
    echo "copying client assets to local asset pipeline..."
    mkdir -p public/static
    cp -r client/build/static/media server/public/static/media
    cp client/build/static/js/site.*.js server/app/assets/javascripts/site.js
    cp client/build/static/js/map.*.js server/app/assets/javascripts/map.js
    cp client/build/static/css/site.*.css server/app/assets/stylesheets/site.css
    cp client/build/static/css/map.*.css server/app/assets/stylesheets/map.css
    ;;

    build_emails)
    echo "building emails..."
    cd emails
    yarn install
    yarn build
    cd ..
    mkdir -p server/app/views/app_mailer
    cp emails/dist/admin_message_erb.html       server/app/views/app_mailer/admin_message.html.erb
    cp emails/dist/admin_message_text.html      server/app/views/app_mailer/admin_message.text.erb
    cp emails/dist/admin_notification_erb.html  server/app/views/app_mailer/admin_notification.html.erb
    cp emails/dist/admin_notification_text.html server/app/views/app_mailer/admin_notification.text.erb
    cp emails/dist/place_message_erb.html       server/app/views/app_mailer/place_message.html.erb
    cp emails/dist/place_message_text.html      server/app/views/app_mailer/place_message.text.erb
    ;;

    build_server)
    echo "building server..."
    cd server
    bundle exec rake assets:precompile
    ;;

    build)
    $0 clean
    $0 build_client
    $0 build_emails
    $0 build_server
    ;;


    lint)
    cd client
    node_modules/eslint/bin/eslint.js .
    cd ..
    ;;

    seed)
    cd server
    psql teikei_dev < config/dump.sql
    bundle exec rake db:migrate
    cd ..
    ;;

    prod)
    cd server
    RAILS_ENV=production bundle exec rails s
    ;;

    dev-emails)
    cd emails
    yarn start
    ;;

    # --- server deployment task -- don't try to run this locally

    deploy_client)
    source ~/.bash_profile
    echo "building client..."
    cd client
    yarn install
    NODE_ENV=production npm run build
    cd ..
    echo "copying client assets to asset pipeline..."
    mkdir -p public/static
    cp -r client/build/static/media public/static/media
    cp client/build/static/js/site.*.js app/assets/javascripts/site.js
    cp client/build/static/js/map.*.js app/assets/javascripts/map.js
    cp client/build/static/css/site.*.css app/assets/stylesheets/site.css
    cp client/build/static/css/map.*.css app/assets/stylesheets/map.css
    ;;

    # ---

    *)
    usage
    exit 1
    ;;
esac
