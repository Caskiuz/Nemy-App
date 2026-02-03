# NEMY - Local Food & Market Delivery App

## Overview
NEMY is a Progressive Web App (PWA) designed for local food and market delivery in Autlán, Mexico. Its primary purpose is to connect local businesses, customers, and delivery personnel, facilitating convenient access to local produce and prepared foods. The app distinguishes itself with a unique market module that supports weight-based products with custom specifications and includes features for seasonal events, starting with Carnaval 2026. The vision is to empower local economies by providing a robust, user-friendly platform for small businesses to reach a wider customer base.

## User Preferences
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `node_modules`.
Do not make changes to the file `package-lock.json`.
I prefer detailed explanations for complex logic.
I prefer to use functional programming paradigms where appropriate.
I like clean, readable code with comprehensive comments.
I prefer simple language in explanations.

## System Architecture
The NEMY application is built with a client-server architecture.

**Frontend:**
*   Developed using **React Native with Expo**, targeting a Progressive Web App experience.
*   Features a multi-role authentication system for customers, businesses, delivery personnel, and administrators.
*   Includes core functionalities like cart management, secure checkout with card/cash options, and real-time order tracking.
*   Incorporates advanced features such as a real-time collapsible map for tracking, scheduled and recurring orders, an in-app chat system, favorites, quick reorder options, and delivery tipping.
*   Delivery drivers have an online/offline toggle, GPS navigation integration, and an earnings dashboard.
*   Business owners can manage multiple businesses with a dedicated "Mis Negocios" screen, switch between businesses via a selector in Dashboard/Products, and view per-business statistics.
*   Business owners can create new businesses with name, description, type, address, phone, and image; delete businesses (only if no active orders); and view consolidated stats across all their businesses.
*   The UI/UX design emphasizes a Mexican festive aesthetic with a warm, energetic color scheme (`#FF8C00` primary) and the Nunito font family, evoking local market vibes. Micro-animations, haptic feedback, and custom toast/modal components enhance user interaction.

**Backend:**
*   Implemented with **Express.js using TypeScript**.
*   Manages API endpoints for authentication, user and order management, Stripe payments, business dashboards, delivery operations, reviews, coupons, support tickets, carnival events, and administrative functions.
*   Includes robust features like wallet management, commission distribution, cancellation rules with penalties, and a system for reporting and resolving order issues.
*   Supports dynamic delivery zones, automatic delivery fee calculation, and auto-assignment of drivers based on proximity.

**Advanced UX Features (January 2026):**
*   **Stock-out Substitution Preferences**: Customers can set substitution preferences during checkout with 3 options: Refund, Call Me, or Substitute (similar item). Preferences apply globally or per-item.
*   **Cash Payment Module**: When paying with cash, customers enter the bill denomination and the app calculates change automatically.
*   **60-Second Regret Timer**: After placing an order, customers see a countdown timer with option to cancel without penalty during this period.
*   **Slammed Mode**: Businesses can toggle "Modo Saturado" which adds +20 minutes to all new orders during high-demand periods.
*   **Menu 86 (Out of Stock)**: Business owners can long-press (600ms) on order items to quickly mark products as out of stock.

**Database:**
*   **PostgreSQL** is used as the relational database, interfaced via **Drizzle ORM**.
*   The schema includes tables for `users`, `addresses`, `orders`, `carnival_events`, `businesses`, `products`, `reviews`, `coupons`, `support_tickets`, `support_messages`, `order_status_history`, `wallets`, `wallet_transactions`, `withdrawal_requests`, `commission_settings`, `cancellation_rules`, `user_penalties`, `order_issues`, `issue_photos`, `delivery_zones`, `delivery_assignments`, `admin_logs`, and `rate_limits`.

**Security & Admin Features:**
*   **Admin Dashboard**: Real-time metrics panel with orders today, cancellations, average delivery time, online drivers, and paused businesses. Auto-refreshes every 30 seconds.
*   **Real-time Map**: Shows active orders and online drivers on a map (native only, placeholder on web).
*   **Audit Logging**: All sensitive admin actions are logged to `admin_logs` table with user ID, email, action, resource, IP address, and user agent.
*   **Rate Limiting**: IP-based rate limiting protects against brute force attacks (5 attempts/minute for login, 100 requests/minute general). Blocked IPs are stored in `rate_limits` table with 15-minute lockout.

**Admin Panel Tabs:**
*   Dashboard - Real-time metrics and map
*   Resumen - Statistics overview
*   Usuarios - User management
*   Pedidos - Order management
*   Negocios - Business management
*   Productos - Product management
*   Logs - Audit trail viewer

## External Dependencies
*   **Stripe**: For payment processing, including payment intents, webhooks, setup intents for card registration, and auto-charging on delivery. `stripe-replit-sync` is used for development.
*   **Twilio**: Integrated for SMS phone verification, sending 6-digit verification codes.
*   **Resend**: Utilized for sending transactional emails, such as order confirmations.
*   **OpenAI**: Powers the AI support chat functionality within the `SupportChatScreen`.
*   **Expo-notifications**: Handles notification permissions and scheduling, including carnival event reminders.
*   **Expo-location**: Used for location permissions in order tracking and delivery functionalities.
*   **Google Maps/Waze/Apple Maps**: External navigation apps integrated for delivery route guidance.