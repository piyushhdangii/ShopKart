# ShopKart

ShopKart is a full-stack MERN shopping application. Customers can create an account, browse a product catalogue, search and filter products, save items to a wishlist, manage a shopping cart, complete checkout, and review their orders. The React storefront uses a responsive, warm neutral and olive visual theme.

## Features

- Customer registration and login with bcrypt password hashing and an HTTP-only JWT cookie.
- Product catalogue with category and name search, product details, stock display, and product creation API.
- Persistent customer wishlist and shopping cart stored in MongoDB.
- Cart quantity updates, stock checks, item removal, and order subtotal calculation.
- Shipping address collection and order history/detail pages.
- Razorpay checkout integration when credentials are configured.
- A mock payment flow for local development when Razorpay credentials are not configured.
- Responsive layouts for desktop and mobile.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Axios, Vite 8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | bcrypt, JSON Web Tokens, HTTP-only cookies |
| Payments | Razorpay (optional for local development) |

## Repository layout

```text
ShopKart/
├── Client/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Navbar, product cards, search, and shared UI
│   │   ├── context/         # Shared cart state
│   │   ├── pages/           # Home, catalogue, account, cart, and order pages
│   │   └── services/        # Frontend API clients
│   ├── index.html
│   └── package.json
└── Server/
    ├── config/              # Razorpay integration
    ├── controllers/         # API request handlers
    ├── middlewares/         # Authentication middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # Express API routes
    ├── utils/               # Token utilities
    ├── index.js             # Express and MongoDB entry point
    └── package.json
```

## Requirements

- Node.js **20.19+** or **22.12+** (required by Vite 8).
- npm.
- A MongoDB database, local or hosted (for example, MongoDB Atlas).
- Optional: Razorpay test or live API credentials for real payment checkout.

Check installed versions:

```bash
node --version
npm --version
```

## Local setup

### 1. Configure the backend

Create `Server/.env`:

```dotenv
MongoDB_URI=mongodb://127.0.0.1:27017/shopkart
jwt_secret=replace-with-a-long-random-secret

# Optional. Omit these to use the development mock-payment flow.
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

For MongoDB Atlas, replace `MongoDB_URI` with the database connection string and make sure the database user and network access are configured. `MongoDB_URI` and `jwt_secret` are required for the backend to start and authenticate users. Keep `.env` files and payment secrets private; do not commit them.

Install dependencies and start the API:

```bash
cd Server
npm install
npm start
```

The API listens at `http://localhost:8001`. The server connects to MongoDB before it starts accepting requests.

### 2. Start the frontend

In a second terminal:

```bash
cd Client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The frontend API client currently connects to `http://localhost:8001`, and the server CORS configuration permits `http://localhost:5173`.

### 3. Create an account and add products

Register an account through the app’s **Sign up** page, then sign in. The product catalogue starts empty unless products have already been added to the database.

Products can currently be created through `POST http://localhost:8001/products`. No authentication is required for this route. Provide all of the following fields:

```json
{
  "name": "Everyday Backpack",
  "description": "A versatile backpack for everyday use.",
  "price": 2499,
  "category": "Accessories",
  "image": "https://example.com/backpack.jpg",
  "stock": 12
}
```

Use an HTTP client such as Postman, Insomnia, or a REST client to send the JSON body with `Content-Type: application/json`. The `image` value should be a URL that the browser can load. Product categories are stored as text, so the category used when creating an item should match the category used when filtering it.

## Available scripts

Run these commands from the corresponding project directory.

### Client

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `Client/dist`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint on the client source. |

### Server

| Command | Description |
| --- | --- |
| `npm start` | Start the API with Nodemon. |

There is no configured server test suite yet. The server package’s `npm test` script is currently a placeholder and exits with an error.

## Application routes

| Path | Page |
| --- | --- |
| `/login` | Sign in |
| `/register` | Create an account |
| `/home` | Storefront home |
| `/products` | Search and browse products |
| `/products/:id` | Product details |
| `/wishlist` | Saved products |
| `/cart` | Shopping cart |
| `/checkout` | Shipping and payment |
| `/orders` | Order history |
| `/orders/:id` | Order details |
| `/order-success/:id` | Order confirmation |

The root path (`/`) redirects to `/login`. Protected API requests use the authentication cookie issued at login.

## API overview

The backend base URL is `http://localhost:8001`.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/users/register` | No | Register a customer |
| `POST` | `/users/login` | No | Sign in and set the auth cookie |
| `GET` | `/users/me` | Yes | Get the signed-in customer |
| `GET` | `/users/logout` | No | Clear the auth cookie |
| `GET` | `/products` | No | List products; accepts optional `search` and `category` query parameters |
| `GET` | `/products/:id` | No | Get product details |
| `POST` | `/products` | No | Create a product |
| `GET` | `/wishlist` | Yes | Get the signed-in customer’s wishlist |
| `POST` | `/wishlist/:productId` | Yes | Add a product to the wishlist |
| `DELETE` | `/wishlist/:productId` | Yes | Remove a product from the wishlist |
| `PATCH` | `/wishlist/:productId/toggle` | Yes | Toggle a wishlist item |
| `GET` | `/cart` | Yes | Get the signed-in customer’s cart |
| `POST` | `/cart/:productId` | Yes | Add a product to the cart |
| `PATCH` | `/cart/:productId` | Yes | Set a cart item quantity (`{ "quantity": 2 }`) |
| `DELETE` | `/cart/:productId` | Yes | Remove a cart item |
| `POST` | `/orders/create-payment-order` | Yes | Validate shipping details and create a payment order |
| `POST` | `/orders/verify-payment` | Yes | Verify payment and place the order |
| `GET` | `/orders` | Yes | List the signed-in customer’s orders |
| `GET` | `/orders/:id` | Yes | Get one of the signed-in customer’s orders |

Authenticated endpoints expect the `token` cookie set by `/users/login`. The frontend uses Axios with credentials enabled.

## Payment configuration

When both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set, checkout creates and verifies Razorpay orders. Use Razorpay test credentials for development.

When either credential is missing, the current backend and checkout flow use a mock payment path so local development can proceed without Razorpay. This mock behavior is for development only; configure real credentials and review payment verification and deployment settings before accepting real payments.

## Notes

- The backend CORS origin and the frontend API URL are currently configured for local development (`localhost:5173` and `localhost:8001`). Update both for a different deployment origin.
- The API uses a JWT secret named `jwt_secret` (lowercase, including the underscore).
- Products, customers, carts, wishlists, and orders are persisted in MongoDB.
- Do not expose Razorpay secrets or production JWT secrets in frontend code.
