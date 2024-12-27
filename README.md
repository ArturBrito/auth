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
4. [API Endpoints](#api-endpoints)
5. [Installation](#installation)
6. [Running the Project](#running-the-project)
7. [Technical Details](#technical-details)
   - [Architecture](#architecture)
   - [Dependencies](#dependencies)
8. [Contributing](#contributing)
9. [License](#license)

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
2. SELECTED_SETUP
   - This is the variable that defines the mode in which the application is running. The modes are explained in [Getting Started](#getting-started)
      - inMemory
      - mongoWithRedis
      - mongoWithoutRedis
      - firebase

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
4. REDIS_URI
   - **Redis** URI
5. REDIS_PASSWORD
   - Password for **Redis**

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

1. EMAIL_SERVICE
   - The service being used. Ex: google, Mailgun, etc.
2. EMAIL_USER
3. EMAIL_PASS

<br><br>

## Generate Keys
If we don't use Firebase to store user data (and consequently encrypt and decrypt the token) we will have to generate keys for this purpose.  
Let's generate it by following the next steps on your machine:
> // Don't add passphrase  
> ssh-keygen -t rsa -b 4096 -m PEM -f rs256.rsa  
> openssl rsa -in rs256.rsa -pubout -outform PEM -out rs256.rsa.pub

These commands generated two files (rs256.rsa and rs256.rsa.pub). These two files must be kept in the root of the project.  
_It will also be these two keys that you must use in your project to decrypt the tokens generated by this system._

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

# API Endpoints
## User
### Register new user
POST `/api/user`
* **Description:** Registers a new user with a username and password
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