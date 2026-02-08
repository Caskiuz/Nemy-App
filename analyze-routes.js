const fs = require('fs');
const path = require('path');

// Archivos de rutas a analizar
const routeFiles = [
  'server/apiRoutes.ts',
  'server/apiRoutesCompact.ts',
  'server/deliveryRoutes.ts',
  'server/supportRoutes.ts',
  'server/favoritesRoutes.ts',
  'server/walletRoutes.ts'
];

const routeMap = {};

routeFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ No existe: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(file, '.ts');
  
  // Buscar rutas: router.get, router.post, router.put, router.delete, router.patch
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  
  let match;
  const routes = [];
  
  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const route = match[2];
    routes.push({ method, route });
  }
  
  routeMap[fileName] = routes;
  console.log(`\n📁 ${fileName}: ${routes.length} rutas`);
});

// Generar reporte
console.log('\n\n========================================');
console.log('  MAPA DE RUTAS CONSOLIDADO');
console.log('========================================\n');

Object.keys(routeMap).forEach(file => {
  console.log(`\n## ${file.toUpperCase()}`);
  console.log('─'.repeat(50));
  
  const routes = routeMap[file];
  const grouped = {};
  
  routes.forEach(({ method, route }) => {
    if (!grouped[route]) grouped[route] = [];
    grouped[route].push(method);
  });
  
  Object.keys(grouped).sort().forEach(route => {
    const methods = grouped[route].join(', ');
    console.log(`${methods.padEnd(20)} ${route}`);
  });
});

// Detectar duplicados
console.log('\n\n========================================');
console.log('  RUTAS DUPLICADAS');
console.log('========================================\n');

const allRoutes = {};
Object.keys(routeMap).forEach(file => {
  routeMap[file].forEach(({ method, route }) => {
    const key = `${method} ${route}`;
    if (!allRoutes[key]) allRoutes[key] = [];
    allRoutes[key].push(file);
  });
});

let hasDuplicates = false;
Object.keys(allRoutes).forEach(key => {
  if (allRoutes[key].length > 1) {
    console.log(`⚠️  ${key}`);
    console.log(`   Archivos: ${allRoutes[key].join(', ')}`);
    hasDuplicates = true;
  }
});

if (!hasDuplicates) {
  console.log('✅ No hay rutas duplicadas');
}

// Generar archivo de rutas consolidadas
console.log('\n\n========================================');
console.log('  GENERANDO ARCHIVO CONSOLIDADO');
console.log('========================================\n');

const consolidatedContent = `// MAPA DE RUTAS CONSOLIDADO - Generado automáticamente
// Fecha: ${new Date().toISOString()}

/*
ESTRUCTURA ACTUAL:

${Object.keys(routeMap).map(file => {
  return `${file}:\n${routeMap[file].map(r => `  ${r.method} ${r.route}`).join('\n')}`;
}).join('\n\n')}
*/

export const ROUTE_MAP = ${JSON.stringify(routeMap, null, 2)};
`;

fs.writeFileSync('server/ROUTE_MAP.ts', consolidatedContent);
console.log('✅ Archivo generado: server/ROUTE_MAP.ts');
