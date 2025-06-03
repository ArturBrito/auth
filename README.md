[![codecov](https://codecov.io/gh/ArturBrito/auth/branch/main/graph/badge.svg)](https://codecov.io/gh/ArturBrito/auth)

![logo](./assets/logo.webp "Logo")
# Authentication System

**Disclaimer:** This project is developed for personal use and as part of a portfolio. I am not responsible for any issues that arise from using this system.

## Overview
This project provides a ready-to-use authentication system with minimal configuration.  

The system ensures:

- **Stateless Authentication:** With JWT, user sessions are managed without maintaining server-side state.
- **Role-Based Access Control:** Permissions can be implemented by encoding roles or privileges into the token claims.

It supports registration and authentication via:
- **Username and password**
- **Google** (OAuth 2.0)

Possibility to choose where to store the data:
- **In Memory** (for the purpose of testing and developing)
- **MongoDB**
- **Firebase Authentication System**
- **Firebase Authentication System** and **MongoDB** (under analysis to see if it makes sense)

## Documentation Index

1. [Getting Started](#getting-started)
2. [System Features](#system-features)
   - [Authentication Methods](#authentication-methods)
   - [Data Storage](#data-storage)
   - [Token Management](#token-management)
3. [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [Generate Keys](#generate-keys)
    - [Firebase Keys](#firebase-keys)
    - [Google Cloud](#google-cloud)
4. [Installation and Running the Project](#installation-and-running-the-project)
5. [API Endpoints](#api-endpoints)
6. [Technical Details](#technical-details)
   - [Architecture](#architecture)
   - [Dependencies](#dependencies)
7. [License](#license)

<br><br>

# Getting Started
This application can run in several modes. What differentiates these modes is where the data is written and whether refresh tokens are maintained (which is advisable for better security).  
You can run this application in the following modes:
1. Everthing in memory
   - With this option we can run the application without any additional infrastructure. Should be used for testing only.
2. With **MongoDB** for storing user data and **Redis** to manage the _refresh tokens_
   - This option requires an instance of MongoDB and an instance of Redis to be running (a docker-compose file is available to test this mode - later in [Running the Project](#running-the-project)) and is the recommended mode
3. With **MongoDB** but without a mechanism to handle _refresh tokens_ (not recommended)
4. With **Firebase**
   - This option does not require any additional infrastructure to be running, but requires extra configuration in Firebase (later in [Firebase Keys](#firebase-keys)).


There are some configurations to be made for each case explained in [Configuration](#configuration)

<br><br>

# System Features
## Authentication Methods
This authentication system supports two primary methods for user authentication:

1. Username and Password Authentication
   - Standard registration and login process.
   - Passwords are securely hashed using bcrypt before being stored, ensuring sensitive user data is protected.
   - Login credentials are validated against the hashed values during authentication.

2. Google OAuth 2.0
   - Users can log in or register using their Google accounts.
   - The system integrates with Google's OAuth 2.0 API to handle the authentication process securely.
   - After successful authentication, users are issued a JWT token to maintain session state.

## Data Storage
The system supports multiple data storage solutions to store user credentials and other data, making it highly configurable for diverse use cases:

- In-Memory Storage (for development and testing).
- MongoDB for persistent data storage.
- Firebase for projects leveraging Google’s backend services.
- Combined options under analysis, such as Firebase Authentication System with MongoDB.

## Token Management
The system employs the following mechanisms for token management:

1. Access Token Expiry
   - Access tokens are short-lived to minimize risks in case of token theft.
   - Clients must use a refresh token to request a new access token once the old one expires.
2. Refresh Token Storage
   - Each refresh token is kept in an in-memory database with Redis until it is used or the token expires. This prevents the same refresh token from being used more than once.

<br><br>

# Configuration
## Environment Variables
To run the application under **development**, an .env file can be created in the root of the project and the variables with the values ​​inserted there.  
To run the application in production another mechanism will have to be used but the variables will be the same.  
<br>
There are some variables that only need to be defined depending on the mode in which the application is running. Others have to be defined independently of this.

### Variables common to all modes
1. NODE_ENV
   - Defines the environment in which the application is located.
      - development
      - production
2. AUTH_PORT
   - Defines the port in wich the application will run
3. SELECTED_SETUP
   - This is the variable that defines the mode in which the application is running. The modes are explained in [Getting Started](#getting-started)
      - inMemory
      - mongoWithRedis
      - mongoWithoutRedis
      - firebase
4. PASSWORD_REQUIREMENTS (optional)
   - A string that define the rules for password. Example: ^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$  
   The absent of this variable will use the following requirements for the password:
      - Minimum 8 characters
      - At least one uppercase
      - At least one lowercase
      - At least one digit
      - At least one special character
5. CREATE_ACCOUNT_URL (optional - will use the default value if not provided)
   - The URL that goes in the create account email to the user validate account (default: http://localhost:3000).  
   Example: `https://mydomain.com` (the rest of the url will be added automatically)
6. RESET_PASSWORD_URL (optional - will use the default value if not provided)
   - The URL that goes in the reset password email. This url should be the full path to your page with the fields to reset password. The reset code and email goes in the URL parameters.  
   Example: `https://mydomain.com/reset-password`


<br>

Now we will define the varibles for each option of **_SELECTED_SETUP_** variable

### Variables to inMemory
No aditional environment variables are needed  

### Variables to mongoWithRedis
1. MONGO_INITDB_ROOT_USERNAME
   - Username for **MongoDB**
2. MONGO_INITDB_ROOT_PASSWORD
   - Password for **MongoDB**
3. MONGO_URI
   - **MongoDB** URI

#### Redis can be runned with a single instance or with a _sentinel_ for high availability
#### Variabels to run in a single instance
1. REDIS_URI
   - **Redis** URI
2. REDIS_PORT
   - **Redis** Port
3. REDIS_PASSWORD
   - Password for **Redis**

#### Variabels to run with a _sentinel_
1. REDIS_SENTINELS
   - The addresses of the sentinels. Example:
   ```
   REDIS_SENTINELS=192.168.1.152:26379,192.168.1.156:26379,192.168.1.157:26379
   ```
2. REDIS_MASTER_NAME
   - The name that you set for the replication
3. REDIS_PASSWORD
   - The password that you set for the replication

### Variables to mongoWithoutRedis
1. MONGO_INITDB_ROOT_USERNAME
   - Username for **MongoDB**
2. MONGO_INITDB_ROOT_PASSWORD
   - Password for **MongoDB**
3. MONGO_URI
   - **MongoDB** URI

### Variables to inMemory
No aditional environment variables are needed  

### Google OAuth
If we want to use Google OAuth (sign in with google) we will need to configure the following variables:
1. GOOGLE_CLIENT_ID
2. GOOGLE_CLIENT_SECRET
3. GOOGLE_CALLBACK_URL

The [Google Cloud](#google-cloud) explains what the variables are and how to access them.

### SMTP
As this service sends emails, we need to configure the SMTP server

1. EMAIL_HOST
2. EMAIL_PORT
   - Need to be between ""
3. EMAIL_USER
4. EMAIL_PASS
5. EMAIL_CREATE_SUBJECT
   - The string that will be in the create email subject
6. EMAIL_CHANGED_PASSWORD_SUBJECT
   - The string that will be in the change email notification subject
7. EMAIL_RESET_SUBJECT
   - The string that will be in the reset password email subject

The service is able to send the email as html. You can make your own html template, for that you need to:
- Create a html file with the link `<a id="action-link">PLACEHOLDER</a>` anywhere
- Put the html file inside html folder the root of the project
- Configure the environment variables (for create account, change password and) with the name of the html file (without the extension)
   - EMAIL_CREATE_HTML
      - example: `EMAIL_CREATE_HTML=example1`
   - EMAIL_CHANGED_PASSWORD_HTML
   - EMAIL_RESET_HTML

<br><br>

## Generate Keys
If we don't use Firebase to store user data (and consequently sign and verify the token) we will have to generate keys for this purpose.  
Let's generate it by following the next steps on your machine:
> ssh-keygen -t rsa -b 4096 -m PEM -f rs256.rsa  
> openssl rsa -in rs256.rsa -pubout -outform PEM -out rs256.rsa.pub

These commands generated two files (rs256.rsa and rs256.rsa.pub). These two files must be kept in the root of the project.  
_It will also be these two keys that you must use in your project to verify the tokens generated by this system._

<br><br>

## Firebase Keys
### **This step is only necessary if we are going to use Firebase to store user data**  
To download the keys we have to go to the Firebase console and create a project (if we don't already have one created).
In this project we have to activate authentication and Email/Password mode.  
After that, in General Project Settings -> Service accounts -> Generate private key  

<br>

The generated file must be renamed to **_config-firebase.json_** and placed in the root of the project

<br><br>

## Google Cloud
### **This step is only necessary if we are going to use Google OAuth (sign in with google)**  

Here we will have to configure an application on Google Cloud. To do this, we created the application and activated the Google+ API.
After this we create OAuth Credentials. After this we will have access to the client ID and client Secret Key (these two variables must be created as stated in [Environment Variables](#environment-variables)).
The last step we have to do is add the following URI in the "Authorized redirect URIs" part:
- http://localhost:3000/api/google/callback

This will be the value for the enviornment variable GOOGLE_CALLBACK_URL

> Note: When the system is running on a machine that is not local (when it is in production for example) it will have to be added here too, but only by updating the http://localhost:3000 part. The remainder must be kept

<br><br>

# Installation and Running the Project

This project can be installed and run in multiple ways, depending on your needs and setup. Below are the available options:

### Easiest Way (For Testing and Development)
1. Create a `.env` file in the root of the project with all the required environment variables for your setup (refer to [Configuration](#configuration)).
2. Run the project using the `docker-compose.dev.yml` file:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
   This will build the Docker image and spin up all required services for testing and development.

### Run Barebones (No Docker)
You can run the project directly on your machine without using Docker:
1. Ensure you have Node.js and npm installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the project:
   ```bash
   npm start
   ```
   OR
   ```
   npm run build
   npm run start:prod
   ```
4. Make sure any required services (e.g., MongoDB, Redis) are running and configured.

### Build
You can build the Docker image targeting either development or production and use it in your preferred setup, as long as the environment variables are properly configured.
To build the Docker image you can use this commands:
>docker build --target development -t auth-dev .  
>docker build --target production -t auth-prod .

You can also create a Docker Compose file and run the application directly from it.

#### Note: The environment variable of NODE_ENV should match the build target
<br><br>

# API Endpoints
_Note: Only the success cases are represented here_
## User
### Register new user
POST `/api/user`
* **Description:** Registers a new user with a username and password. The user is created with the role of User
* **Request Body:**
```
{
    "email": "artur.brito95@gmail.com",
    "password": "teste1"
}
```
* **Sucess Status Code:** 201
* **Response:**
```
{
    "uid": "0be9691d-4e1d-4bb9-8376-a40a810bf5af",
    "email": "artur.brito95@gmail.com",
    "role": "user"
}
```

### Activate user account
PUT `/api/user/activate/:email/:activationCode`
* **Description:** Activate user account
* **Sucess Status Code:** 200
* **Response:**
```
{
    "uid": "0be9691d-4e1d-4bb9-8376-a40a810bf5af",
    "email": "artur.brito95@gmail.com",
    "role": "user"
}
```

### Resend activation code
POST `/api/user/resend-activation-code`
* **Description:** Resend the validation code to the user
* **Request Body:**
```
{
    "email": "artur.brito95@gmail.com"
}
```
* **Sucess Status Code:** 200

### Delete user
DELETE `/api/user/delete`
* **Description:** Delete user
* **Request Headers:**
```
{
    "Authorization": "Bearer token"
}
```
* **Sucess Status Code:** 204

### Change password
PUT `/api/user/change-password`
* **Description:** Update user password
* **Request Headers:**
```
{
    "Authorization": "Bearer token"
}
```
* **Request Body:**
```
{
    "password": "teste1",
    "newPassword: "teste2"
}
```
* **Sucess Status Code:** 204

### Request user reset password
POST `/api/user/reset-password-request`
* **Description:** This request will send an email with a reset link
* **Request Body:**
```
{
    "email": "artur.brito95@gmail.com"
}
```
* **Sucess Status Code:** 200

### Reset password
POST `/api/user/reset-password`
* **Description:** Reset the user password with the new password provided
* **Request Body:**
```
{
    "email": "artur.brito95@gmail.com",
    "resetCode": "adjsfnafkjsadnfkj",
    "newPassword": "teste3"
}
```
* **Sucess Status Code:** 204

<br>

## Authentication
### Signin
POST `/api/signin`
* **Description:** Receive an email and password and return tokens to access the resources
* **Request Body:**
```
{
    "email": "artur.brito95@gmail.com",
    "password": "teste1"
}
```
* **Sucess Status Code:** 200
* **Response:**
```
{
    "token": "token",
    "refreshToken": "refreshToken"
}
```

### Refresh Token
POST `/api/refreshtoken`
* **Description:** Receive a refresh token and receive a new token and a new refresh token
* **Request Body:**
```
{
    "refreshToken": "refresh token"
}
```
* **Sucess Status Code:** 200
* **Response:**
```
{
    "token": "token",
    "refreshToken": "refreshToken"
}
```

### Google OAuth
GET `/api/google`
* **Description:** This is the endpoint to sign in with google
* **Sucess Status Code:** 200

# Technical Details
## Architecture
The project follows a clean architecture with inversion and dependency injection principles.
In the diagram, not all implementations for each interface are represented,  only one to serve as an example.  
![Architecture](/docs/architecture/architecture.svg)
### Sequence Diagrams
The sequence diagrams of the the requests are placed in [SD's](docs/authentication/SDs.md)
## Dependencies
_All the dependencies are present in the package.json file_
The production dependencies are:
```json
"dependencies": {
   "bcryptjs": "^3.0.2",
   "cors": "^2.8.5",
   "express": "^4.21.1",
   "express-async-errors": "^3.1.1",
   "express-validator": "^7.2.0",
   "firebase-admin": "^13.0.1",
   "inversify": "^6.1.6",
   "ioredis": "^5.6.1",
   "jsonwebtoken": "^9.0.2",
   "mongoose": "^8.9.5",
   "morgan": "^1.10.0",
   "nodemailer": "^6.9.16",
   "passport": "^0.7.0",
   "passport-google-oauth20": "^2.0.0",
   "reflect-metadata": "^0.2.2",
   "uuid": "^11.0.3",
   "winston": "^3.17.0",
   "winston-daily-rotate-file": "^5.0.0"
}
```

The dev dependencies are only used for developing and testing. When the project is built with the --production flag, these packages will not be installed.
```json
"devDependencies": {
   "@types/bcrypt": "^5.0.2",
   "@types/cors": "^2.8.17",
   "@types/express": "^4.17.21",
   "@types/jest": "^29.5.14",
   "@types/jsonwebtoken": "^9.0.7",
   "@types/morgan": "^1.9.9",
   "@types/nodemailer": "^6.4.17",
   "@types/passport": "^1.0.17",
   "@types/supertest": "^6.0.3",
   "dotenv": "^16.4.7",
   "jest": "^29.7.0",
   "jest-html-reporter": "^4.1.0",
   "jest-junit": "^16.0.0",
   "mongodb-memory-server": "^10.1.4",
   "nodemon": "^3.1.7",
   "rimraf": "^6.0.1",
   "supertest": "^7.1.1",
   "ts-jest": "^29.2.5",
   "ts-mockito": "^2.6.1",
   "ts-node": "^10.9.2"
}
```


# License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.