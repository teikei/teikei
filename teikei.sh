#!/usr/bin/env bash

function usage(){
    echo "teikei"
    echo
    echo "$0 dev   - run in development mode"
    echo "$0 build - build for production"
    echo "$0 prod  - run in production mode"
    echo "$0 clean - cleanup"
}


if [[ $# != 1 ]] ; then
    usage
    exit 1
fi

case $1 in
    dev)
    cd client
    npm install
    cd ..
    bundle exec foreman start --procfile=Procfile-dev
    ;;

    clean)
    echo "cleaning client..."
    cd client
    rm -rf build
    rm -rf node_modules
    cd ..
    echo "cleaning server..."
    bundle exec rake assets:clobber
    rm -rf public/static
    rm app/assets/javascripts/app.js app/assets/javascripts/map.js app/assets/javascripts/new.js
    rm app/assets/stylesheets/app.css app/assets/stylesheets/map.css app/assets/stylesheets/new.css
    ;;

    build_client)
    echo "building client..."
    cd client
    npm install
    NODE_ENV=production npm run build
    cd ..
    echo "copying client assets to asset pipeline..."
    mkdir -p public/static
    cp -r client/build/static/media public/static/media
    cp client/build/static/js/app.*.js app/assets/javascripts/app.js
    cp client/build/static/js/map.*.js app/assets/javascripts/map.js
    cp client/build/static/js/new.*.js app/assets/javascripts/new.js
    cp client/build/static/css/app.*.css app/assets/stylesheets/app.css
    cp client/build/static/css/map.*.css app/assets/stylesheets/map.css
    cp client/build/static/css/new.*.css app/assets/stylesheets/new.css
    ;;

    build_server)
    echo "building server..."
    bundle exec rake assets:precompile
    ;;

    build)
    $0 clean
    $0 build_client
    $0 build_server
    ;;

    prod)
    RAILS_ENV=production bundle exec rails s
    ;;

    *)
    usage
    exit 1
    ;;
esac
