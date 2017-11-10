#!/usr/bin/env bash

function usage() {
    echo "teikei"
    echo
    echo "$0 dev   - run in development mode"
    echo "$0 build - build for production"
    echo "$0 lint  - lint javascript code"
    echo "$0 prod  - run in production mode"
    echo "$0 clean - cleanup"
}

if [[ $# != 1 ]] ; then
    usage
    exit 1
fi

case $1 in
    dev)
    npm -g install foreman
    cd client
    yarn install
    cd ../server
    bundle install
    bundle exec foreman start --procfile ../Procfile-dev -d ..
    ;;

    clean)
    echo "cleaning client..."
    cd client
    rm -rf build
    rm -rf node_modules
    cd ..
    echo "cleaning server..."
    cd server
    bundle exec rake assets:clobber
    rm -rf public/static
    rm app/assets/javascripts/site.js app/assets/javascripts/map.js
    rm app/assets/stylesheets/site.css app/assets/stylesheets/map.css
    ;;

    build_client)
    echo "building client..."
    cd client
    yarn install
    NODE_ENV=production npm run build
    cd ..
    $0 copy_client
    ;;

    deploy_client)
    source ~/.bash_profile
    $0 build_client
    ;;

    copy_client)
    echo "copying client assets to asset pipeline..."
    mkdir -p public/static
    cp -r client/build/static/media server/public/static/media
    cp client/build/static/js/site.*.js server/app/assets/javascripts/site.js
    cp client/build/static/js/map.*.js server/app/assets/javascripts/map.js
    cp client/build/static/css/site.*.css server/app/assets/stylesheets/site.css
    cp client/build/static/css/map.*.css server/app/assets/stylesheets/map.css
    ;;

    lint)
    cd client
    node_modules/eslint/bin/eslint.js .
    cd ..
    ;;

    build_server)
    echo "building server..."
    cd server
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
