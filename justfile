# Shows help
default:
    @just --list --justfile {{ justfile() }}

# build the app
build: __install
    @yarn run build --base=./

# run the app in a development mode
run:
    @yarn start --host 0.0.0.0

# run dev stack and start the app in a development mode
run-dev:
    @echo "Starting the database..."
    @docker-compose -f docker-compose-dev.yml up -d postgres
    @echo "Starting Synapse..."
    @docker-compose -f docker-compose-dev.yml up -d synapse
    @echo "Ensure admin user is registered..."
    @docker-compose -f docker-compose-dev.yml exec synapse register_new_matrix_user --admin -u admin -p admin -c /config/homeserver.yaml http://localhost:8008 || true
    @echo "Starting the app..."
    @yarn start --host 0.0.0.0

# stop the dev stack
stop-dev:
    @docker-compose -f docker-compose-dev.yml stop


register-user localpart password *admin:
	docker-compose exec synapse register_new_matrix_user {{ if admin == "1" {"--admin"} else {"--no-admin"} }} -u {{ localpart }} -p {{ password }} -c /config/homeserver.yaml http://localhost:8008



# run the app in a production mode
run-prod: build
    @python -m http.server -d dist 1313

# install the project
__install:
    @yarn install --immutable --network-timeout=300000
