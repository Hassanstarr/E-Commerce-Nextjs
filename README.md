# Next.js E-Commerce Website. Completed Features and Functionality

Below is a structured list of the features implemented so far in your ShopEase Next.js e-commerce website. You can use it as project documentation, an internship progress report, or a checklist for tracking development.

# 1. User Side. Storefront

Customer-facing pages and shopping functionality

## 1.1 Home Page

- Home section for the main storefront.
- Navigation to the store's main sections.
- Footer containing links to the Contact and Products sections.
- Admin users can access the Admin Panel from the navbar.
- Admin Panel includes a View Store option that redirects to `/`.

## 1.2 Products Section

- Display the available products.
- Filter products using the available filtering options.
- Navigate to an individual product details page.
- Category selection redirects to the Products section with the selected category filter applied.

## 1.3 Product Details Page. `/products/[id]`

- View individual product details.
- Add products to the cart only when sufficient stock is available.
- Add products to the wishlist regardless of stock availability.

## 1.4 Categories Section

- Display product categories.
- Select a category to navigate to the Products section.
- Automatically apply the selected category as a product filter.

## 1.5 Shopping Cart

- View products added to the cart.
- Increase or decrease product quantities.
- Remove individual products.
- Clear the entire cart.
- Calculate the subtotal based on cart items and quantities.
- Proceed to checkout.

## 1.6 Checkout

- Enter customer information:
  - Full name
  - Email address
  - Phone number
  - Delivery address
  - City
  - Postal code
- Select the payment method. Currently, Cash on Delivery (CoD) is available.
- View the order summary, including subtotal, delivery fee, and total amount.
- Place an order.
- Receive an order confirmation email at the email address provided during checkout.

## 1.7 Wishlist

- View all wishlisted products.
- Add wishlisted products to the cart.
- Remove products from the wishlist.
- Keep out-of-stock products in the wishlist for future purchases.

## 1.8 Account Section

- View basic account information.
- Display the user's name and email address.
- Display the account role, such as `user` or `admin`.

## 1.9 Contact Section

- Contact form with name, email, and message fields.
- Submit inquiries through the contact form.
- Send submitted contact information to the developer's email address.

# 2. Admin Side. Management Panel

Administrative dashboard, store management, reporting, and monitoring

## 2.1 Admin Access and Navigation

- Admin users are redirected to `/admin` after login.
- Dedicated admin panel without the regular storefront navbar.
- Sidebar navigation with the following sections:
  - Dashboard
  - Products
  - Categories
  - Orders
  - Customers
  - Analytics
  - Activity
- View Store option redirects to `/`.
- Admin users can return to the Admin Panel through the admin option in the storefront navbar.

## 2.2 Dashboard. `/admin`

The dashboard provides an overview of the store's performance and operational status.

### Summary cards

- Total revenue
- Total orders
- Products sold
- Number of customers

### Dashboard components

- Revenue Overview chart
- Order Summary
- Recent Orders
- Top Products
- Low Stock Products

## 2.3 Products Management. `/admin/products`

### Summary cards

- Total products
- Low-stock products
- Out-of-stock products

### Search and filtering

- Search products using a search box.
- Filter products by category.
- Filter products by stock status:
  - All Stock
  - In Stock
  - Low Stock
  - Out of Stock

### Product operations

- Add new products through a modal form.
- Edit existing products through a modal form.
- Delete products.
- View product stock information and manage product inventory.

## 2.4 Categories Management. `/admin/categories`

### Summary information

- Total categories
- Total products across categories

### Features

- Search and filter categories.
- Add categories through a modal form.
- Edit existing categories through a modal form.
- Delete categories.
- Display the number of products associated with each category.

## 2.5 Orders Management. `/admin/orders`

### Summary cards

- Total orders
- Pending orders
- Active orders, including confirmed and shipped orders
- Delivered orders
- Cancelled orders

### Search and filtering

- Search orders.
- Filter by order status.
- Filter by payment status.

### Order operations

- View individual orders.
- Open the detailed order page at `/admin/orders/[id]`.

## 2.6 Order Details. `/admin/orders/[id]`

### Order information

- Complete order details.
- Order timeline.
- Customer information.
- Ordered products, quantities, and pricing.
- Order and payment status.

### Administrative actions

- Change the order status.
- Change the payment status.
- Add an administrative note.
- Update the order using the Update Order button.
- Cancel the order using the Cancel Order button.

## 2.7 Customers Management. `/admin/customers`

### Summary cards

- Total customers
- Active customers
- Inactive customers
- Average amount spent per customer

### Search and filtering

- Search customers.
- Filter customers by activity status:
  - All Customers
  - Active Customers
  - Inactive Customers

### Customer operations

- View the customer list.
- Open individual customer details at `/admin/customers/[id]`.

## 2.8 Customer Details. `/admin/customers/[id]`

### Customer profile

- Complete customer information.
- Account registration date.
- Last order date.
- Total amount spent.
- Average spending per order.

### Order history

- List of the customer's orders.
- Order status for each order.
- Option to view individual orders.

## 2.9 Analytics. `/admin/analytics`

### Reporting periods

Select the reporting period for analytics:

- Last 7 days
- Last 30 days
- Last 3 months
- Last 6 months
- This year

### Export functionality

\- Export analytics reports in `.csv` format.

### Summary metrics

- Total revenue
- Total orders
- Products sold
- Average order value

### Charts and reports

- Revenue Overview graph
- Order Overview graph
- Sales by Category graph
- Top Products
- Payment Status pie chart
- Order Performance

### Key performance indicators

- Average Order Value (AOV)
- Cancellation Rate
- Total Revenue
- Products Sold

## 2.10 Activity Monitoring. `/admin/activity`

### Summary cards

- Total activities
- Order activities
- Product activities
- Customer activities

### Search and filtering

- Search activities.
- Filter by activity type.

### Tracked activities

- Product creation and updates.
- Category creation and updates.
- Order status updates.
- New customer registrations.

## 3. Project Structure at a Glance

| Area                | Main route              |
| ------------------- | ----------------------- |
| Storefront          | `/`                     |
| Products            | `/products`             |
| Product details     | `/products/[id]`        |
| Categories          | `/categories`           |
| Cart                | `/cart`                 |
| Checkout            | `/checkout`             |
| Wishlist            | `/wishlist`             |
| Account             | `/account`              |
| Contact             | `/contact`              |
| Admin dashboard     | `/admin`                |
| Product management  | `/admin/products`       |
| Category management | `/admin/categories`     |
| Order management    | `/admin/orders`         |
| Order details       | `/admin/orders/[id]`    |
| Customer management | `/admin/customers`      |
| Customer details    | `/admin/customers/[id]` |
| Analytics           | `/admin/analytics`      |
| Activity monitoring | `/admin/activity`       |

## 4. Important Functional Notes

The features above describe the functionality you have listed as implemented. Before marking the entire project as production-ready, these are the key areas worth verifying.

- Backend integration: Dashboard statistics, analytics, charts, top products, category sales, customer metrics, and CSV exports should use real database-backed data rather than hardcoded frontend values.
- Order consistency: Order totals, stock availability, delivery fees, order status, and payment status should be calculated or validated on the server.
- Security: Admin routes and administrative API operations must enforce role-based authorization on the server, not just hide pages in the frontend.
- Email delivery: Verify both order confirmation emails and contact form emails, including error handling for failed delivery.
- Product and category operations: Confirm that adding, editing, and deleting records updates the database and that related products and orders remain consistent.
- Activity tracking: Confirm that relevant administrative operations and new customer registrations generate activity records.
- Analytics accuracy: Verify reporting date ranges, revenue calculations, cancellation handling, and exported CSV values against the underlying database records.

This distinction is important: a feature appearing in the interface does not necessarily mean its backend integration and calculations have been fully verified.

## 5. Overall Project Summary

Your ShopEase project includes two major components:

- Customer storefront: Product discovery, category filtering, cart management, wishlist, checkout, Cash on Delivery, email notifications, account information, and contact form.
- Administrative system: Dashboard, product and category CRUD, order management, customer profiles, analytics and exports, and activity monitoring.

Together, these features establish a full-stack e-commerce application with customer purchasing workflows and administrative store management. The remaining step is to verify the end-to-end behavior of each feature, particularly database integration, analytics accuracy, authorization, and email delivery, before describing every module as fully tested.

## Gemini support when admins are offline

The existing Live Chat uses Gemini for customer support when no admin is connected to the chat inbox. Replies are labelled **AI assistant**, saved in the same conversation, and visible to admins when they return. An admin counts as online while their chat inbox has an authenticated WebSocket connection; stale presence expires after 35 seconds. Being logged into another admin page does not mark an admin available for chat.

Create an API key in [Google AI Studio](https://aistudio.google.com/app/apikey). Add these server-side environment settings to `.env.local` and Vercel Production:

```env
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

`GEMINI_MODEL` is optional; it defaults to the model shown above. Never prefix the key with `NEXT_PUBLIC_`. Restart both `npm run dev` and `npm run dev:chat` locally after adding the key. Redeploy Vercel after setting it there. No extra scheduler, Gemini SDK, model training, or RAG setup is required.

`npm run dev:chat` watches the chat code and restarts when it changes. If an older chat process is already running, stop it and start this command once to enable watching. Refreshing the browser alone does not reload that server's AI instructions.

The bot receives up to the last 20 messages from this conversation. Gemini can request read-only data through `get_store_data`: the customer's name/email, recent orders or a specific full/short order ID, cart, wishlist, and public product searches with current prices, discounts and stock. The server takes the customer ID from the authenticated conversation; Gemini cannot select another customer. Only requested sections are sent to Google, with bounded lists (20 orders, 30 cart/wishlist items, 10 product search results), and incomplete results are marked. Passwords, codes, session data, card details, shipping addresses and private payment identifiers are excluded. There are no write tools: policies, refunds, cancellations, and staff decisions are left for the team. Do not put unsupported store policies into its instructions in `services/gemini.service.ts`.

User messages are acknowledged immediately while Gemini responds separately. Replies allow up to three provider requests within a shared 50-second provider timeout, a 2,000-character limit, and a per-customer limit of 10 AI attempts per minute in addition to the normal chat limit. API failures explicitly report that the AI is temporarily unavailable; the original customer message remains available to staff. Check the chat server logs for provider errors (401/403: key/access, 404: model, 429: quota). Duplicate requests are claimed once. A reply is discarded if an admin comes online or the conversation advances before it is saved, so an old answer does not overwrite newer messages.

To test manually, close every admin chat tab and send a new message from a customer account. Allow up to 35 seconds for a disconnected admin's old presence to expire. Reopen the admin chat inbox to test human replies and see the AI history. With no API key, chat keeps its existing offline-message behaviour. Automated tests use an isolated database and a mocked Gemini response, without sending real customer messages to Google.
