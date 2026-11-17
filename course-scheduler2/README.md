# Project Setup and Installation

## Prerequisites
- Node.js and npm installed
- MySQL

## 1. Set Up the Server (Backend)

Open a terminal and navigate to the server directory:

- cd server


Install the server dependencies:

- npm install

Create your .env file using the example:

- cp .env.example .env

Open .env and enter your actual database credentials.

## 2. Set Up the Database

Open MySQL and execute the SQL files in this order:

1. schema.sql – Creates the database tables.
2. seed.sql – Inserts the initial sample data.

### Start the Server

From inside the server directory, run:

- npm run dev


## 3. Set Up the Client (Frontend)

Open a second terminal and navigate to the project's root directory.

Install the client dependencies:


- npm install


Start the client:

- npm run dev


Open the local URL displayed in the terminal (usually `http://localhost:5173`).

