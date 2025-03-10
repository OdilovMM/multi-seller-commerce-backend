﻿# multi-seller-commerce-backend
Multi-Seller Commerce Backend

Overview

This is a Node.js backend for a multi-vendor e-commerce platform. It enables sellers to list products, customers to place orders, and admins to manage the system. The backend is built using Express.js and MongoDB, with authentication, product management, order processing, and payment handling.

Features

User authentication (Admin, Seller, Customer)

Product management with multiple variations

Order management and tracking

Payment processing integration

Reviews and ratings

Category and subcategory support

Tech Stack

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Authentication: JWT (JSON Web Token)

File Uploads: express-fileupload

Payment Gateway: (Specify if applicable, e.g., Stripe, PayPal)

Installation

Prerequisites

Ensure you have the following installed:

Node.js

MongoDB

Steps to Install

# Clone the repository
git clone https://github.com/OdilovMM/multi-seller-commerce-backend.git

# Navigate to the project directory
cd multi-seller-commerce-backend

# Install dependencies
npm install

# Create a .env file and configure environment variables
cp .env.example .env

Running the Project

Start the Development Server

npm run dev

Start the Production Server

npm start

API Endpoints

Authentication

POST /api/auth/register - Register a new user

POST /api/auth/login - Login user

Products

POST /api/products - Create a new product (Seller only)

GET /api/products - Retrieve all products

GET /api/products/:id - Get product by ID

PUT /api/products/:id - Update a product (Seller only)

DELETE /api/products/:id - Delete a product (Seller only)

Orders

POST /api/orders - Place an order

GET /api/orders/:id - Get order details

PUT /api/orders/:id/status - Update order status (Admin only)

Reviews

POST /api/reviews - Add a review

GET /api/reviews/:productId - Get product reviews

Environment Variables

Create a .env file in the root directory and add the following variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

License

This project is licensed under the MIT License.
