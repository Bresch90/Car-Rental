# Car Rental
Before you start the project make sure you have Maven, Java 17, Docker ( for easy setup of database ), Node 16 LTS and NPM installed.

## Preface
I solved this project without any prior knowledge of Javascript, React, HTML, CSS, Postgresql or Spring boot.
I also finished the assignment within 5 working days.  
This was the last commit on Commits on Mar 20, 2024.  

Later I polished the project some more to where it is today.  

As I have no prior experience with the frontend and only basic knowledge about the backend
if you have comments or other guidance, even if it's simple stuff, please share it with me!  
I'm very open to critic!

## How to start the project
#### 1. Set up the database
Create the docker container using:  
`docker run --name postgresql -p 5432:5432 -e POSTGRESQL_USERNAME=my_user -e POSTGRESQL_PASSWORD=password123 -e POSTGRESQL_DATABASE=rental bitnami/postgresql:latest`  

The table will be created on first booting the backend.
#
#### 2. Start the backend
Start the backend by running  
`com.example.rental.RentalApplication#main`
#
#### 3. Start the frontend
The `package.json` has a proxy for the backend hosted at `http://localhost:8080`, make sure nothing else is running on the port.  
Start the frontend by doing `npm install` followed by `npm start` in the `frontend` folder.
Server should start on `http://localhost:3000`
#
#### 4. Run tests!
Run backend tests using `mvn test` in the IDE terminal and pressing `ctrl + enter` or `right clicking` the folder `src/test/java/com/example/rental` and running `Run 'Tests in 'rental''`  

Run frontend tests by running `npm test` in the terminal in `frontend` folder.
