[![Build Status](https://travis-ci.org/Awesome-Technologies/synapse-admin.svg?branch=master)](https://travis-ci.org/Awesome-Technologies/synapse-admin)

# Synapse admin ui

This project is built using [react-admin](https://marmelab.com/react-admin/).

Use `yarn install` after cloning this repo.

Use `yarn start` to launch the webserver.

## Step-By-Step install:

You have two options:

   1. Download the source code from github and run using nodejs
   2. Run the Docker container

Steps for 1):

- install `git`: `apt install git`
- install `nodejs`: `snap install --channel=12/stable --classic node`
- download the source code: `git clone https://github.com/Awesome-Technologies/synapse-admin.git`
- go into download directory: `cd synapse-admin`
- download dependencies: `yarn install`
- start web server: `yarn start`


Steps for 2):

- run the Docker container: `docker run -p8080:80 awesometechnologies/synapse-admin`
- go to http://localhost:8080

