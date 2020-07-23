[![Build Status](https://travis-ci.org/Awesome-Technologies/synapse-admin.svg?branch=master)](https://travis-ci.org/Awesome-Technologies/synapse-admin)

# Synapse admin ui

This project is built using [react-admin](https://marmelab.com/react-admin/).

It needs at least Synapse v1.14.0 for all functions to work as expected!

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

Steps for 2):

- run the Docker container: `docker run -p 8080:80 awesometechnologies/synapse-admin`
- browse to http://localhost:8080

## Screenshots

![Screenshots](./screenshots.jpg)
