[![Build Status](https://travis-ci.org/Awesome-Technologies/synapse-admin.svg?branch=master)](https://travis-ci.org/Awesome-Technologies/synapse-admin)

# Synapse admin ui

This project is built using [react-admin](https://marmelab.com/react-admin/).

It needs at least Synapse v1.32.0 for all functions to work as expected!

You get your server version with the request `/_synapse/admin/v1/server_version`.
See also [Synapse version API](https://github.com/matrix-org/synapse/blob/develop/docs/admin_api/version_api.rst).

After entering the URL on the login page of synapse-admin the server version appears below the input field.

You need access to the following endpoints:

- `/_matrix`
- `/_synapse/admin`

See also [Synapse administration endpoints](https://github.com/matrix-org/synapse/blob/develop/docs/reverse_proxy.md#synapse-administration-endpoints)

## Step-By-Step install:

You have two options:

1.  Download the source code from github and run using nodejs
2.  Run the Docker container

Steps for 1):

- make sure you have installed the following: git, yarn, nodejs
- download the source code: `git clone https://github.com/Awesome-Technologies/synapse-admin.git`
- change into downloaded directory: `cd synapse-admin`
- download dependencies: `yarn install`
- start web server: `yarn start`

You can fix the homeserver, so that the user can no longer define it himself.
Either you define it at startup (e.g. `REACT_APP_SERVER=https://yourmatrixserver.example.com yarn start`)
or by editing it in the [.env](.env) file. See also the
[documentation](https://create-react-app.dev/docs/adding-custom-environment-variables/).

Steps for 2):

- run the Docker container from the public docker registry: `docker run -p 8080:80 awesometechnologies/synapse-admin` or use the (docker-compose.yml)[docker-compose.yml]: `docker-compose up -d`

  > note: if you're building on an architecture other than amd64 (for example a raspberry pi), make sure to define a maximum ram for node. otherwise the build will fail.

  ```yml
  version: "3"

  services:
    synapse-admin:
      container_name: synapse-admin
      hostname: synapse-admin
      build:
        context: https://github.com/Awesome-Technologies/synapse-admin.git
        # args:
        #   - NODE_OPTIONS="--max_old_space_size=1024"
      ports:
        - "8080:80"
      restart: unless-stopped
  ```

- browse to http://localhost:8080

## Screenshots

![Screenshots](./screenshots.jpg)

## Development

- Use `yarn test` to run all style, lint and unit tests
- Use `yarn fix` to fix the coding style
