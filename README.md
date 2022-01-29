# Synapse admin ui

This project is built using [react-admin](https://marmelab.com/react-admin/).

It needs at least Synapse v1.49.0 for all functions to work as expected!

You get your server version with the request `/_synapse/admin/v1/server_version`.
See also [Synapse version API](https://matrix-org.github.io/synapse/develop/admin_api/version_api.html).

After entering the URL on the login page of synapse-admin the server version appears below the input field.

You need access to the following endpoints:

- `/_matrix`
- `/_synapse/admin`

See also [Synapse administration endpoints](https://matrix-org.github.io/synapse/develop/reverse_proxy.html#synapse-administration-endpoints)

## Step-By-Step install

- make sure you have installed the following: git, yarn, nodejs
- download the source code: `git clone https://github.com/matrix07012/synapse-admin.git`
- change into downloaded directory: `cd synapse-admin`
- download dependencies: `yarn install`
- start web server: `yarn start`

You can fix the homeserver, so that the user can no longer define it himself.
Either you define it at startup (e.g. `REACT_APP_SERVER=https://yourmatrixserver.example.com yarn start`)
or by editing it in the [.env](.env) file. See also the
[documentation](https://create-react-app.dev/docs/adding-custom-environment-variables/).

## Screenshots

![Screenshots](./screenshots.jpg)

## Development

- Use `yarn test` to run all style, lint and unit tests
- Use `yarn fix` to fix the coding style
