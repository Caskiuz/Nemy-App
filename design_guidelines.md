# NEMY - Design Guidelines

## Brand Identity

**Purpose**: NEMY is a local delivery app for Autlán connecting customers with restaurants and markets, with a unique market module for weight-based products and custom specifications.

**Aesthetic Direction**: **Bold/Energetic** - High contrast, vibrant, optimistic. Think fresh produce markets meets modern efficiency. The app should feel fast, trustworthy, and distinctly local (not a generic international clone).

**Memorable Element**: The market module's specification system. This is NEMY's superpower - letting customers specify exactly what they want ("carne delgada sin grasa"). Highlight this feature visually with subtle animations when users add notes.

**Differentiation**: NEMY uses a vibrant orange color scheme (#FF8C00) - energetic, warm, and appetizing. This evokes the warmth of Mexican markets, fresh citrus, and the energy of local community commerce.

## Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs + Floating Action Button)

Tabs:
- **Inicio** (Home) - Featured businesses, suggestions, Carnival button
- **Pedidos** (Orders) - Order history and tracking
- **[FAB]** - Quick reorder from favorites
- **Favoritos** (Favorites) - Saved businesses and recurring orders
- **Perfil** (Profile) - User settings and preferences

**Authentication Flow**: Stack-only (Login → Verify Email → Role Selection → Main App)

**Screen List**:
1. **Login** - OAuth + email/password entry
2. **Signup** - Registration with role selection
3. **Email Verification** - OTP entry screen
4. **Password Recovery** - Email entry
5. **Home** - Business grid, suggestions, search, Carnival button (conditional)
6. **Business Detail** - Menu/products, business info, hours
7. **Product Detail** - Image, price, notes field (required for market items)
8. **Cart** - Line items, modify quantities, notes visible
9. **Checkout** - Address confirmation, payment method selection
10. **Order Tracking** - Live map, progress bar, contact buttons
11. **Order History** - Past orders list
12. **Reorder Modal** - Quick confirm to reorder
13. **Favorites** - Saved businesses and recurring orders
14. **Profile** - Avatar, name, theme, accent color, share app
15. **Business Dashboard** (role: business) - Orders, products, featured customers
16. **Delivery Dashboard** (role: delivery) - Available orders, active delivery
17. **Admin Panel** (role: admin) - Users, businesses, carnival events, metrics
18. **Carnival Events** - List of events with images

## Screen-by-Screen Specifications

### Login Screen
- **Header**: None (full-screen branded)
- **Layout**: 
  - NEMY logo at top (40% of screen height)
  - OAuth buttons (Google with icon, not just text)
  - Divider "o continúa con email"
  - Email/password form
  - "¿Olvidaste tu contraseña?" link
  - Bottom: "¿No tienes cuenta? Regístrate"
- **Safe Area**: All content within insets + Spacing.xl

### Home Screen
- **Header**: Transparent with search icon (right), location pill (left showing city)
- **Layout**:
  - Greeting: "Hola, [FirstName]" (bold, large)
  - Carousel of featured businesses (horizontal scroll, 3 visible)
  - If Carnival active: Prominent "Ver Programa de Carnaval" button with festive styling
  - Section: "Restaurantes cerca de ti"
  - Grid of business cards (2 columns, image, name, rating, delivery time)
  - Section: "Mercados"
  - Grid of market cards
- **Empty State**: "No hay negocios disponibles" with custom illustration (farmer's market basket)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Business Detail Screen
- **Header**: Custom with back button, share icon, favorite icon (heart)
- **Layout**:
  - Hero image (business banner, 200px tall)
  - Business profile image overlapping (-40px from bottom of banner)
  - Name, rating, delivery time row
  - Hours badge (Open/Closed with color)
  - Section tabs: "Menú" / "Información"
  - Product grid (if restaurant) or list (if market with weight-based)
  - Floating Cart Preview Button (if items in cart) at bottom
- **Safe Area**: Top: 0, Bottom: tabBarHeight + Spacing.xl + 60px (cart button)

### Product Detail Screen (Modal)
- **Header**: Close X (top right), transparent background
- **Layout**:
  - Product image (full width, 250px)
  - Name (bold, large)
  - Price (or "Precio por kilo: $X")
  - If market item: Required field "Especificaciones" with placeholder "Ej: carne delgada sin grasa"
  - If previous order: "Tus preferencias guardadas:" chip showing saved note
  - Quantity selector
  - Add to Cart button (full-width, bottom, sticky)
- **Safe Area**: Bottom: insets.bottom + Spacing.xl

### Cart Screen
- **Header**: Default with "Carrito" title
- **Layout**:
  - Business name (if single) or multiple business warning
  - List of cart items (image thumbnail, name, price, quantity, notes chip if present)
  - Subtotal row
  - "Continuar al pago" button (bottom, sticky)
- **Empty State**: "Tu carrito está vacío" illustration (empty shopping bag)
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl + 60px

### Order Tracking Screen
- **Header**: Default with "Seguimiento" and help icon
- **Layout**:
  - Progress bar (4 stages: Recibido, Preparando, En camino, Entregado)
  - Map showing customer pin, delivery pin (if assigned), live route
  - Delivery person card (avatar, name, rating) - slides up over map
  - Contact buttons row: WhatsApp, Call
  - Order details (collapsed accordion)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Profile Screen
- **Header**: Default with "Perfil" title, logout icon (right)
- **Layout**:
  - Avatar (editable, 100px circle)
  - Name (editable)
  - Email (read-only)
  - Settings list:
    - Tema (Claro/Oscuro toggle)
    - Color de acento (color picker)
    - Direcciones guardadas
    - Métodos de pago
    - Compartir NEMY (with share icon)
  - Bottom: "Cerrar sesión" and "Eliminar cuenta" (danger)
- **Safe Area**: Top: Spacing.xl, Bottom: tabBarHeight + Spacing.xl

## Color Palette

**Primary**: #00C853 (Vibrant Green) - Freshness, local markets, go
**Primary Dark**: #00A043 - For hover/pressed states
**Background**: #FAFAFA (Light) / #121212 (Dark)
**Surface**: #FFFFFF (Light) / #1E1E1E (Dark)
**Text Primary**: #212121 (Light) / #FFFFFF (Dark)
**Text Secondary**: #757575 (Light) / #B0B0B0 (Dark)
**Accent**: User-customizable (default #FF6B35 - Energetic orange for CTAs)
**Success**: #4CAF50
**Warning**: #FFC107
**Error**: #F44336
**Border**: #E0E0E0 (Light) / #333333 (Dark)

**Carnival Theme Override** (when active): Add #FFD700 gold accents, #E91E63 pink for festive feel.

## Typography

**Primary Font**: **Nunito** (Google Font) - Friendly, modern, highly legible
**Secondary Font**: System (SF Pro / Roboto) for body text on small screens

**Type Scale**:
- Hero: Nunito Bold, 32px
- H1: Nunito Bold, 24px
- H2: Nunito Bold, 20px
- H3: Nunito SemiBold, 18px
- Body: Nunito Regular, 16px
- Caption: Nunito Regular, 14px
- Small: Nunito Regular, 12px

## Visual Design

- **Cards**: 12px border radius, no harsh shadows (use elevation via subtle 0,2px shadow with 0.08 opacity)
- **Buttons**: 8px border radius, full-width for primary actions
- **Icons**: Feather icon set from @expo/vector-icons, 24px default size
- **Floating Cart Button**: Fixed bottom right, circular, Primary color, white icon, drop shadow (offset: 0,4px, opacity: 0.15, radius: 8)
- **Progress Bar**: 4 dots connected by lines, active dot is Primary color with subtle pulse animation
- **Touchable Feedback**: Scale down to 0.97 on press for cards, opacity 0.7 for buttons

## Assets to Generate

**Required**:
1. **icon.png** - NEMY logo (green shopping bag with smile), 1024x1024 - Device home screen
2. **splash-icon.png** - Same logo on Primary color background, 1024x1024 - App launch
3. **empty-cart.png** - Friendly illustration of empty shopping bag with handles - Cart screen empty state
4. **empty-orders.png** - Illustration of calendar with checkmark - Order history empty state
5. **empty-favorites.png** - Illustration of heart with bookmark - Favorites empty state
6. **empty-businesses.png** - Illustration of farmer's market basket with produce - Home screen if no businesses
7. **avatar-placeholder.png** - Neutral silhouette on Primary light background - Profile default avatar
8. **carnival-banner.png** - Festive illustration with music notes, confetti - Carnival button hero image
9. **onboarding-welcome.png** - Illustration of delivery person with phone and food - Welcome screen
10. **onboarding-market.png** - Illustration of produce (tomato, lettuce) with specification note - Market feature showcase

**Style**: Flat, minimal, 2-3 colors max per illustration, consistent line weight. Modern but approachable (not childish or corporate).