const fs = require('fs');

const apiRoutesContent = fs.readFileSync('server/apiRoutes.ts', 'utf8');
const compactContent = fs.readFileSync('server/apiRoutesCompact.ts', 'utf8');

// Extraer rutas
const extractRoutes = (content) => {
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  const routes = new Set();
  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    routes.add(`${match[1].toUpperCase()} ${match[2]}`);
  }
  return routes;
};

const apiRoutes = extractRoutes(apiRoutesContent);
const compactRoutes = extractRoutes(compactContent);

console.log('========================================');
console.log('  RUTAS EN apiRoutes.ts PERO NO EN apiRoutesCompact.ts');
console.log('========================================\n');

const missing = [...apiRoutes].filter(r => !compactRoutes.has(r));

// Categorizar rutas faltantes
const categories = {
  'Admin': [],
  'Business': [],
  'Orders': [],
  'User': [],
  'Delivery': [],
  'Auth': [],
  'Payments': [],
  'Other': []
};

missing.forEach(route => {
  if (route.includes('/admin')) categories['Admin'].push(route);
  else if (route.includes('/business')) categories['Business'].push(route);
  else if (route.includes('/order')) categories['Orders'].push(route);
  else if (route.includes('/user')) categories['User'].push(route);
  else if (route.includes('/delivery')) categories['Delivery'].push(route);
  else if (route.includes('/auth')) categories['Auth'].push(route);
  else if (route.includes('/stripe') || route.includes('/payment') || route.includes('/webhook')) categories['Payments'].push(route);
  else categories['Other'].push(route);
});

Object.keys(categories).forEach(cat => {
  if (categories[cat].length > 0) {
    console.log(`\n## ${cat} (${categories[cat].length} rutas)`);
    console.log('─'.repeat(50));
    categories[cat].forEach(r => console.log(`  ${r}`));
  }
});

console.log(`\n\n📊 RESUMEN:`);
console.log(`  apiRoutes.ts: ${apiRoutes.size} rutas`);
console.log(`  apiRoutesCompact.ts: ${compactRoutes.size} rutas`);
console.log(`  Faltantes en Compact: ${missing.length} rutas`);

// Rutas críticas
const critical = [
  '/admin',
  '/business',
  '/orders',
  '/auth',
  '/user/profile',
  '/stripe',
  '/webhooks'
];

console.log(`\n\n⚠️  RUTAS CRÍTICAS FALTANTES:`);
const criticalMissing = missing.filter(r => 
  critical.some(c => r.includes(c))
);
console.log(`  Total: ${criticalMissing.length}`);
