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
    bundle exec foreman start --procfile=Procfile-dev
    ;;

    clean)
    echo "cleaning client..."
    cd client
    nwb clean
    cd ..
    echo "cleaning server..."
    bundle exec rake assets:clobber
    rm -rf public/*.css public/*.js public/*.map public/*.woff public/*.eot public/*.ttf public/*.png public/*.svg public/*.jpg
    rm app/assets/javascripts/app.js app/assets/javascripts/map.js app/assets/javascripts/vendor.js
    rm app/assets/stylesheets/app.css app/assets/stylesheets/map.css app/assets/stylesheets/vendor.css
    ;;

    build_client)
    echo "building client..."
    cd client
    npm run build
    cd ..
    echo "copying client assets to asset pipeline..."
    cp client/dist/* public
    rm public/index.html
    cp client/dist/app.js app/assets/javascripts
    cp client/dist/map.js app/assets/javascripts
    cp client/dist/vendor.js app/assets/javascripts
    cp client/dist/app.*.css app/assets/stylesheets/app.css
    cp client/dist/map.*.css app/assets/stylesheets/map.css
    cp client/dist/vendor.*.css app/assets/stylesheets/vendor.css
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
