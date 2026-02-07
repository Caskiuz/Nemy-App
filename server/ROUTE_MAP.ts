// MAPA DE RUTAS CONSOLIDADO - Generado automáticamente
// Fecha: 2026-02-06T18:28:56.778Z

/*
ESTRUCTURA ACTUAL:

apiRoutes:
  GET /health
  GET /test-wallet/:userId
  GET /auth/test-users
  DELETE /auth/cleanup-user/:userId
  POST /auth/dev-login
  GET /settings/public
  GET /businesses/featured
  POST /coupons/validate
  POST /webhooks/stripe
  POST /delivery/update-location
  GET /delivery/location/:orderId
  GET /businesses
  GET /businesses/:id
  POST /auth/phone-login
  POST /auth/send-code
  POST /auth/phone-signup
  POST /auth/signup
  POST /auth/login
  POST /auth/dev-email-login
  POST /auth/verify-code
  POST /auth/enable-biometric
  POST /auth/disable-biometric
  POST /auth/biometric-login
  GET /user/profile
  PUT /user/profile
  PUT /users/:id
  POST /user/profile-image
  DELETE /user/profile-image
  GET /users/:userId/addresses
  POST /users/:userId/addresses
  PUT /users/:userId/addresses/:addressId/default
  DELETE /users/:userId/addresses/:addressId
  GET /admin/system-config
  PUT /admin/system-config
  POST /connect/create
  GET /connect/dashboard
  GET /connect/commission-rates
  GET /wallet/transactions
  GET /test-wallet/:userId
  GET /wallet/balance
  POST /wallet/withdraw
  GET /wallet/withdrawals
  POST /wallet/withdrawals/:id/cancel
  POST /admin/settings/initialize
  GET /admin/settings
  GET /admin/settings/category/:category
  PUT /admin/settings/:key
  POST /admin/settings
  DELETE /admin/settings/:key
  GET /admin/audit-logs
  GET /admin/audit-logs/user/:userId
  GET /admin/finance/metrics
  GET /admin/finance/balance-sheet
  GET /admin/finance/cashflow
  GET /admin/finance/profit-loss
  GET /business/my-businesses
  POST /business/create
  PUT /business/:id
  DELETE /business/:id
  GET /business/dashboard
  GET /business/orders
  PUT /business/orders/:id/status
  GET /business/stats
  PUT /business/settings
  PUT /business/toggle-status
  GET /business/products
  POST /business/product-image
  POST /upload/business-image
  POST /business/products
  PUT /business/products/:id
  DELETE /business/products/:id
  PUT /business/products/:id/availability
  GET /business/categories
  GET /business/hours
  GET /orders
  GET /favorites/:userId
  GET /stripe/payment-method/:userId
  POST /orders
  GET /orders/:id
  POST /orders/:id/confirm
  GET /delivery/available-orders
  GET /delivery/status
  POST /delivery/toggle-status
  POST /delivery/accept-order/:id
  GET /delivery/my-orders
  GET /delivery/orders
  PUT /delivery/orders/:id/status
  PUT /delivery/orders/:id/status
  GET /delivery/:driverId/earnings
  GET /delivery/earnings
  GET /admin/withdrawals/pending
  GET /admin/withdrawals
  GET /admin/stats
  GET /admin/dashboard/metrics
  GET /admin/dashboard/active-orders
  GET /admin/dashboard/online-drivers
  GET /admin/logs
  GET /admin/drivers
  PUT /admin/drivers/:id/approval
  PUT /admin/drivers/:id/strikes
  GET /admin/withdrawals
  PUT /admin/withdrawals/:id
  GET /admin/coupons
  POST /admin/coupons
  PUT /admin/coupons/:id
  DELETE /admin/coupons/:id
  GET /admin/support/tickets
  GET /admin/support/tickets/:id/messages
  POST /admin/support/tickets/:id/messages
  PUT /admin/support/tickets/:id
  GET /admin/support-tickets
  PUT /admin/support-tickets/:id
  GET /delivery-zones
  GET /admin/delivery-zones
  POST /admin/delivery-zones
  PUT /admin/delivery-zones/:id
  GET /admin/settings
  PUT /admin/settings
  POST /admin/clear-cache
  POST /admin/businesses
  PUT /admin/businesses/:id
  POST /admin/products
  PUT /admin/products/:id
  DELETE /admin/products/:id
  GET /admin/dashboard
  GET /admin/users
  GET /admin/orders
  PUT /admin/orders/:id/status
  GET /admin/businesses
  PUT /admin/users/:id/status
  PUT /admin/users/:id/role
  POST /admin/sync-data
  PUT /admin/businesses/:id/status
  POST /orders/:id/assign-driver
  POST /orders/:id/complete-delivery

apiRoutesCompact:
  GET /health
  GET /user/profile
  GET /businesses
  GET /businesses/featured
  GET /businesses/:id
  GET /delivery/available-orders
  GET /delivery/my-orders
  POST /delivery/accept/:orderId
  POST /delivery/pickup/:orderId
  PUT /delivery/orders/:orderId/status
  POST /delivery/deliver/:orderId
  POST /delivery/location
  GET /delivery/location
  POST /delivery/toggle-online
  GET /delivery/stats
  GET /delivery/status
  POST /delivery/toggle-status
  GET /orders/:orderId/driver-location
  GET /delivery/location/:deliveryPersonId
  GET /favorites/:userId
  POST /favorites
  DELETE /favorites/:businessId
  POST /reviews

deliveryRoutes:
  POST /register
  POST /location
  GET /status
  GET /stats
  POST /toggle-status
  GET /orders
  GET /my-orders
  GET /available-orders
  POST /accept/:orderId
  POST /pickup/:orderId
  PUT /orders/:orderId/status
  POST /deliver/:orderId
  GET /location/:orderId
  GET /location/driver/:deliveryPersonId

supportRoutes:
  GET /tickets/:userId
  POST /chat
  POST /tickets
  GET /tickets/:id/messages
  POST /tickets/:id/messages
  POST /create-ticket
  GET /admin/tickets
  PUT /tickets/:id

favoritesRoutes:
  GET /:userId
  POST /
  DELETE /:id
  GET /check/:userId/:itemId

walletRoutes:
  GET /balance
  GET /transactions
*/

export const ROUTE_MAP = {
  "apiRoutes": [
    {
      "method": "GET",
      "route": "/health"
    },
    {
      "method": "GET",
      "route": "/test-wallet/:userId"
    },
    {
      "method": "GET",
      "route": "/auth/test-users"
    },
    {
      "method": "DELETE",
      "route": "/auth/cleanup-user/:userId"
    },
    {
      "method": "POST",
      "route": "/auth/dev-login"
    },
    {
      "method": "GET",
      "route": "/settings/public"
    },
    {
      "method": "GET",
      "route": "/businesses/featured"
    },
    {
      "method": "POST",
      "route": "/coupons/validate"
    },
    {
      "method": "POST",
      "route": "/webhooks/stripe"
    },
    {
      "method": "POST",
      "route": "/delivery/update-location"
    },
    {
      "method": "GET",
      "route": "/delivery/location/:orderId"
    },
    {
      "method": "GET",
      "route": "/businesses"
    },
    {
      "method": "GET",
      "route": "/businesses/:id"
    },
    {
      "method": "POST",
      "route": "/auth/phone-login"
    },
    {
      "method": "POST",
      "route": "/auth/send-code"
    },
    {
      "method": "POST",
      "route": "/auth/phone-signup"
    },
    {
      "method": "POST",
      "route": "/auth/signup"
    },
    {
      "method": "POST",
      "route": "/auth/login"
    },
    {
      "method": "POST",
      "route": "/auth/dev-email-login"
    },
    {
      "method": "POST",
      "route": "/auth/verify-code"
    },
    {
      "method": "POST",
      "route": "/auth/enable-biometric"
    },
    {
      "method": "POST",
      "route": "/auth/disable-biometric"
    },
    {
      "method": "POST",
      "route": "/auth/biometric-login"
    },
    {
      "method": "GET",
      "route": "/user/profile"
    },
    {
      "method": "PUT",
      "route": "/user/profile"
    },
    {
      "method": "PUT",
      "route": "/users/:id"
    },
    {
      "method": "POST",
      "route": "/user/profile-image"
    },
    {
      "method": "DELETE",
      "route": "/user/profile-image"
    },
    {
      "method": "GET",
      "route": "/users/:userId/addresses"
    },
    {
      "method": "POST",
      "route": "/users/:userId/addresses"
    },
    {
      "method": "PUT",
      "route": "/users/:userId/addresses/:addressId/default"
    },
    {
      "method": "DELETE",
      "route": "/users/:userId/addresses/:addressId"
    },
    {
      "method": "GET",
      "route": "/admin/system-config"
    },
    {
      "method": "PUT",
      "route": "/admin/system-config"
    },
    {
      "method": "POST",
      "route": "/connect/create"
    },
    {
      "method": "GET",
      "route": "/connect/dashboard"
    },
    {
      "method": "GET",
      "route": "/connect/commission-rates"
    },
    {
      "method": "GET",
      "route": "/wallet/transactions"
    },
    {
      "method": "GET",
      "route": "/test-wallet/:userId"
    },
    {
      "method": "GET",
      "route": "/wallet/balance"
    },
    {
      "method": "POST",
      "route": "/wallet/withdraw"
    },
    {
      "method": "GET",
      "route": "/wallet/withdrawals"
    },
    {
      "method": "POST",
      "route": "/wallet/withdrawals/:id/cancel"
    },
    {
      "method": "POST",
      "route": "/admin/settings/initialize"
    },
    {
      "method": "GET",
      "route": "/admin/settings"
    },
    {
      "method": "GET",
      "route": "/admin/settings/category/:category"
    },
    {
      "method": "PUT",
      "route": "/admin/settings/:key"
    },
    {
      "method": "POST",
      "route": "/admin/settings"
    },
    {
      "method": "DELETE",
      "route": "/admin/settings/:key"
    },
    {
      "method": "GET",
      "route": "/admin/audit-logs"
    },
    {
      "method": "GET",
      "route": "/admin/audit-logs/user/:userId"
    },
    {
      "method": "GET",
      "route": "/admin/finance/metrics"
    },
    {
      "method": "GET",
      "route": "/admin/finance/balance-sheet"
    },
    {
      "method": "GET",
      "route": "/admin/finance/cashflow"
    },
    {
      "method": "GET",
      "route": "/admin/finance/profit-loss"
    },
    {
      "method": "GET",
      "route": "/business/my-businesses"
    },
    {
      "method": "POST",
      "route": "/business/create"
    },
    {
      "method": "PUT",
      "route": "/business/:id"
    },
    {
      "method": "DELETE",
      "route": "/business/:id"
    },
    {
      "method": "GET",
      "route": "/business/dashboard"
    },
    {
      "method": "GET",
      "route": "/business/orders"
    },
    {
      "method": "PUT",
      "route": "/business/orders/:id/status"
    },
    {
      "method": "GET",
      "route": "/business/stats"
    },
    {
      "method": "PUT",
      "route": "/business/settings"
    },
    {
      "method": "PUT",
      "route": "/business/toggle-status"
    },
    {
      "method": "GET",
      "route": "/business/products"
    },
    {
      "method": "POST",
      "route": "/business/product-image"
    },
    {
      "method": "POST",
      "route": "/upload/business-image"
    },
    {
      "method": "POST",
      "route": "/business/products"
    },
    {
      "method": "PUT",
      "route": "/business/products/:id"
    },
    {
      "method": "DELETE",
      "route": "/business/products/:id"
    },
    {
      "method": "PUT",
      "route": "/business/products/:id/availability"
    },
    {
      "method": "GET",
      "route": "/business/categories"
    },
    {
      "method": "GET",
      "route": "/business/hours"
    },
    {
      "method": "GET",
      "route": "/orders"
    },
    {
      "method": "GET",
      "route": "/favorites/:userId"
    },
    {
      "method": "GET",
      "route": "/stripe/payment-method/:userId"
    },
    {
      "method": "POST",
      "route": "/orders"
    },
    {
      "method": "GET",
      "route": "/orders/:id"
    },
    {
      "method": "POST",
      "route": "/orders/:id/confirm"
    },
    {
      "method": "GET",
      "route": "/delivery/available-orders"
    },
    {
      "method": "GET",
      "route": "/delivery/status"
    },
    {
      "method": "POST",
      "route": "/delivery/toggle-status"
    },
    {
      "method": "POST",
      "route": "/delivery/accept-order/:id"
    },
    {
      "method": "GET",
      "route": "/delivery/my-orders"
    },
    {
      "method": "GET",
      "route": "/delivery/orders"
    },
    {
      "method": "PUT",
      "route": "/delivery/orders/:id/status"
    },
    {
      "method": "PUT",
      "route": "/delivery/orders/:id/status"
    },
    {
      "method": "GET",
      "route": "/delivery/:driverId/earnings"
    },
    {
      "method": "GET",
      "route": "/delivery/earnings"
    },
    {
      "method": "GET",
      "route": "/admin/withdrawals/pending"
    },
    {
      "method": "GET",
      "route": "/admin/withdrawals"
    },
    {
      "method": "GET",
      "route": "/admin/stats"
    },
    {
      "method": "GET",
      "route": "/admin/dashboard/metrics"
    },
    {
      "method": "GET",
      "route": "/admin/dashboard/active-orders"
    },
    {
      "method": "GET",
      "route": "/admin/dashboard/online-drivers"
    },
    {
      "method": "GET",
      "route": "/admin/logs"
    },
    {
      "method": "GET",
      "route": "/admin/drivers"
    },
    {
      "method": "PUT",
      "route": "/admin/drivers/:id/approval"
    },
    {
      "method": "PUT",
      "route": "/admin/drivers/:id/strikes"
    },
    {
      "method": "GET",
      "route": "/admin/withdrawals"
    },
    {
      "method": "PUT",
      "route": "/admin/withdrawals/:id"
    },
    {
      "method": "GET",
      "route": "/admin/coupons"
    },
    {
      "method": "POST",
      "route": "/admin/coupons"
    },
    {
      "method": "PUT",
      "route": "/admin/coupons/:id"
    },
    {
      "method": "DELETE",
      "route": "/admin/coupons/:id"
    },
    {
      "method": "GET",
      "route": "/admin/support/tickets"
    },
    {
      "method": "GET",
      "route": "/admin/support/tickets/:id/messages"
    },
    {
      "method": "POST",
      "route": "/admin/support/tickets/:id/messages"
    },
    {
      "method": "PUT",
      "route": "/admin/support/tickets/:id"
    },
    {
      "method": "GET",
      "route": "/admin/support-tickets"
    },
    {
      "method": "PUT",
      "route": "/admin/support-tickets/:id"
    },
    {
      "method": "GET",
      "route": "/delivery-zones"
    },
    {
      "method": "GET",
      "route": "/admin/delivery-zones"
    },
    {
      "method": "POST",
      "route": "/admin/delivery-zones"
    },
    {
      "method": "PUT",
      "route": "/admin/delivery-zones/:id"
    },
    {
      "method": "GET",
      "route": "/admin/settings"
    },
    {
      "method": "PUT",
      "route": "/admin/settings"
    },
    {
      "method": "POST",
      "route": "/admin/clear-cache"
    },
    {
      "method": "POST",
      "route": "/admin/businesses"
    },
    {
      "method": "PUT",
      "route": "/admin/businesses/:id"
    },
    {
      "method": "POST",
      "route": "/admin/products"
    },
    {
      "method": "PUT",
      "route": "/admin/products/:id"
    },
    {
      "method": "DELETE",
      "route": "/admin/products/:id"
    },
    {
      "method": "GET",
      "route": "/admin/dashboard"
    },
    {
      "method": "GET",
      "route": "/admin/users"
    },
    {
      "method": "GET",
      "route": "/admin/orders"
    },
    {
      "method": "PUT",
      "route": "/admin/orders/:id/status"
    },
    {
      "method": "GET",
      "route": "/admin/businesses"
    },
    {
      "method": "PUT",
      "route": "/admin/users/:id/status"
    },
    {
      "method": "PUT",
      "route": "/admin/users/:id/role"
    },
    {
      "method": "POST",
      "route": "/admin/sync-data"
    },
    {
      "method": "PUT",
      "route": "/admin/businesses/:id/status"
    },
    {
      "method": "POST",
      "route": "/orders/:id/assign-driver"
    },
    {
      "method": "POST",
      "route": "/orders/:id/complete-delivery"
    }
  ],
  "apiRoutesCompact": [
    {
      "method": "GET",
      "route": "/health"
    },
    {
      "method": "GET",
      "route": "/user/profile"
    },
    {
      "method": "GET",
      "route": "/businesses"
    },
    {
      "method": "GET",
      "route": "/businesses/featured"
    },
    {
      "method": "GET",
      "route": "/businesses/:id"
    },
    {
      "method": "GET",
      "route": "/delivery/available-orders"
    },
    {
      "method": "GET",
      "route": "/delivery/my-orders"
    },
    {
      "method": "POST",
      "route": "/delivery/accept/:orderId"
    },
    {
      "method": "POST",
      "route": "/delivery/pickup/:orderId"
    },
    {
      "method": "PUT",
      "route": "/delivery/orders/:orderId/status"
    },
    {
      "method": "POST",
      "route": "/delivery/deliver/:orderId"
    },
    {
      "method": "POST",
      "route": "/delivery/location"
    },
    {
      "method": "GET",
      "route": "/delivery/location"
    },
    {
      "method": "POST",
      "route": "/delivery/toggle-online"
    },
    {
      "method": "GET",
      "route": "/delivery/stats"
    },
    {
      "method": "GET",
      "route": "/delivery/status"
    },
    {
      "method": "POST",
      "route": "/delivery/toggle-status"
    },
    {
      "method": "GET",
      "route": "/orders/:orderId/driver-location"
    },
    {
      "method": "GET",
      "route": "/delivery/location/:deliveryPersonId"
    },
    {
      "method": "GET",
      "route": "/favorites/:userId"
    },
    {
      "method": "POST",
      "route": "/favorites"
    },
    {
      "method": "DELETE",
      "route": "/favorites/:businessId"
    },
    {
      "method": "POST",
      "route": "/reviews"
    }
  ],
  "deliveryRoutes": [
    {
      "method": "POST",
      "route": "/register"
    },
    {
      "method": "POST",
      "route": "/location"
    },
    {
      "method": "GET",
      "route": "/status"
    },
    {
      "method": "GET",
      "route": "/stats"
    },
    {
      "method": "POST",
      "route": "/toggle-status"
    },
    {
      "method": "GET",
      "route": "/orders"
    },
    {
      "method": "GET",
      "route": "/my-orders"
    },
    {
      "method": "GET",
      "route": "/available-orders"
    },
    {
      "method": "POST",
      "route": "/accept/:orderId"
    },
    {
      "method": "POST",
      "route": "/pickup/:orderId"
    },
    {
      "method": "PUT",
      "route": "/orders/:orderId/status"
    },
    {
      "method": "POST",
      "route": "/deliver/:orderId"
    },
    {
      "method": "GET",
      "route": "/location/:orderId"
    },
    {
      "method": "GET",
      "route": "/location/driver/:deliveryPersonId"
    }
  ],
  "supportRoutes": [
    {
      "method": "GET",
      "route": "/tickets/:userId"
    },
    {
      "method": "POST",
      "route": "/chat"
    },
    {
      "method": "POST",
      "route": "/tickets"
    },
    {
      "method": "GET",
      "route": "/tickets/:id/messages"
    },
    {
      "method": "POST",
      "route": "/tickets/:id/messages"
    },
    {
      "method": "POST",
      "route": "/create-ticket"
    },
    {
      "method": "GET",
      "route": "/admin/tickets"
    },
    {
      "method": "PUT",
      "route": "/tickets/:id"
    }
  ],
  "favoritesRoutes": [
    {
      "method": "GET",
      "route": "/:userId"
    },
    {
      "method": "POST",
      "route": "/"
    },
    {
      "method": "DELETE",
      "route": "/:id"
    },
    {
      "method": "GET",
      "route": "/check/:userId/:itemId"
    }
  ],
  "walletRoutes": [
    {
      "method": "GET",
      "route": "/balance"
    },
    {
      "method": "GET",
      "route": "/transactions"
    }
  ]
};
