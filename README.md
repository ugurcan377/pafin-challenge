# Pafin Typescript Challenge

## Running app and tests with Docker
Assuming you have docker and docker compose installed you can run the tests using the following command
```
docker compose --profile test up
```
For running the api itself, you can run the following command
```
docker compose --profile server up
```
It will setup the application at the `3000` port of `localhost`

## Running app and tests locally

For running the app locally first you need an PostgreSQL server ready, if you already have it you can just
create a `.env` file with the connection url
```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db_name>?schema=public"
```
otherwise you can just use PostgreSQL container from the docker compose, note that it uses the default `5432`
port, this will conflict a local PostgreSQL installation
```
docker compose up -d postgres
```
and use the default the following connection string for this container
```
DATABASE_URL="postgresql://pafin:mysecretpassword@localhost:5432/challenge_test?schema=public"
```
After the database is ready you need to install the dependencies
```
npm install
```
Prisma ORM client files need to be generated, 
```
npx prisma generate
```
Then creating the tables in the database for the first time,
```
npx prisma db push
```
Alternatively if you want some example data to be seeded into the database,
```
npm run seed
```
Finally the api can be started with
```
npm run dev
```
It will setup the application at the `3000` port of `localhost`

For running the tests you can use
```
npm run test
```
**This will the delete the contents of the user table so it's strongly recommended to use
a different database for testing**

## Using the API

Examples here are provided with `curl`. If you wish to you can use your favorite HTTP client instead
Most of the endpoints in the API is protected so first you need a JWT token to access the api
```
curl localhost:3000/auth
```
It will return
```
{"token":"<redacted>"}
```
For simplity sake it's a static token for this application, this can be extended to issue tokens using
the provided credentials in the future
You can use it as a standard bearer to token to access the api
```
curl -s localhost:3000/users  -H "Authorization: Bearer <token>" | jq .
[
  {
    "id": "16b83556-ef4c-4b0f-9e3d-3dc25a393afb",
    "email": "ayamashita@jfa.jp",
    "name": "Yamashita Ayaka",
    "password": "nadeshiko1"
  },
  {
    "id": "4642e643-f481-4d8c-af39-75dd5d4baaa9",
    "email": "rshimizu@jfa.jp",
    "name": "Shimizu Risa",
    "password": "nadeshiko2"
  },
  {
    "id": "70129663-0f81-446b-9aaa-8671becf4bb8",
    "email": "mminami@jfa.jp",
    "name": "Minami Moeka",
    "password": "nadeshiko3"
  }
]
```
In a normal app, passwords would be stored with salted hashes and will be omitted from the response,
here I skipped those steps because this is a simple app for demonstration purposes

## API Documentation

### GET

- `/users`: Get all users
- `/users/:id`: Get a single user based on the id, id has to be a valid uuid

### POST

- `/users`: Create a new user
  - Body:
    - `name: string` (required): Name of the user
    - `email: string` (required): Email for the user, has to be a valid email
    - `password: string` (required): Password for the user, has to be minimum 8 characters

### PUT

- `/users/:id`: Modify a single user based on the id, id has to be a valid uuid
  - Body:
    - `name: string` (optional): Name of the user
    - `email: string` (optional): Email for the user, has to be a valid email
    - `password: string` (optional): Password for the user, has to be minimum 8 characters

### DELETE

- `/users/:id`: Delete a single user based on the id, id has to be a valid uuid