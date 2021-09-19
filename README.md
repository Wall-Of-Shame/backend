# Wall of Shame API

This is the RESTful API for the Wall of Shame application.

## Documentation

This API is documented via Apiary. View the docs [here](https://wallofshame.docs.apiary.io/).

## Setup

### Database - Postgres

1. Ensure you have Postgres 13 on your computer and running.
1. Note down the following:

- A postgres user and their password used to login to Postgres.
- The name of a database instance within Postgres belonging to that user.
- A schema within that database to create the tables in.
- The port and url of the database. Defaults to `localhost:5432`.

You can consider using `pgadmin` to manage the data and database migrations.

### NodeJs

1. Ensure you have NodeJs on your computer, above Node 12.
1. Run `yarn install` to install the dependencies.
1. Create a `.env` file containing the private application ids and database connection setting. using `.env.example` for a template.
1. Run `yarn prisma generate` to get the type definitions for the Prisma ORM.
1. Run `yarn prisma migrate dev` to load the tables.
1. Run `yarn start` to start up the server.

## Common Commands

`yarn start`
Starts the server instance and listens for incoming calls.

`yarn tsc`
Compiles the code without emitting any files.

### Prisma-Specific Commands

`yarn prisma generate`
After changing the `prisma/schema.prisma` file, run this command to load the latest type definitions.

`yarn prisma migrate dev`
After changing the `prisma/schema.prisma` file, run this command to generate the sql commands to modify the underlying table(s).

`yarn prisma studio`
View and manage data in the connected database instance.

## Code Organisation

The entry point for this server is `src/index.ts`. The routes for the various modules are registered through `src/routes.ts`.

Each of this module should generally have:

- `routes.ts`: Routes management for that module.
- `controllers.ts`: Controllers that process each incoming request.
- `queries.ts`: Contains calls to the database.
- `services.ts`: Contains various services to support the controllers.

The `common/` module contains shared logic among the other modules, such as:

- `types/`: Contains API-specific types to support API callees.
- `errors/`: Contains generic error handling code.
