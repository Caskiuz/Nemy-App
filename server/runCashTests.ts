import { runCashFlowTests } from './tests/cashFlowTests';

console.log('🚀 Iniciando pruebas del modelo de efectivo...\n');

runCashFlowTests()
  .then(() => {
    console.log('\n✅ Pruebas completadas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en pruebas:', error);
    process.exit(1);
  });
