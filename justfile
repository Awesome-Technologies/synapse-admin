# Shows help
default:
    @just --list --justfile {{ justfile() }}

# build the app
build: __install
    @yarn run build --base=./

# run the app in a production mode
run: build
    @python -m http.server -d dist 1313

# install the project
__install:
    @yarn install --immutable --network-timeout=300000
