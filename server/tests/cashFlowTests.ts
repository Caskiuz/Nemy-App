// PRUEBAS EXTENSIVAS DEL MODELO DE EFECTIVO Y COMISIONES
import { NewCommissionService } from '../newCommissionService';
import { db } from '../db';
import { orders, wallets, transactions, users } from '../../shared/schema-mysql';
import { eq, and } from 'drizzle-orm';

interface TestResult {
  testName: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

class CashFlowTester {
  private results: TestResult[] = [];

  // ============================================
  // TEST 1: CÁLCULO DE COMISIONES BÁSICO
  // ============================================
  async testBasicCommissions() {
    console.log('\n🧪 TEST 1: Cálculo de Comisiones Básico');
    console.log('='.repeat(60));

    const testCases = [
      {
        name: 'Pedido $85 + $25 delivery',
        subtotal: 8500, // $85.00
        deliveryFee: 2500, // $25.00
        expected: {
          business: 8500, // 100% productos
          driver: 2500, // 100% delivery
          nemy: 1275, // 15% de 8500
          total: 12275 // 8500 + 2500 + 1275
        }
      },
      {
        name: 'Pedido $100 + $30 delivery',
        subtotal: 10000,
        deliveryFee: 3000,
        expected: {
          business: 10000,
          driver: 3000,
          nemy: 1500, // 15% de 10000
          total: 14500
        }
      },
      {
        name: 'Pedido $50 + $20 delivery',
        subtotal: 5000,
        deliveryFee: 2000,
        expected: {
          business: 5000,
          driver: 2000,
          nemy: 750, // 15% de 5000
          total: 7750
        }
      }
    ];

    for (const testCase of testCases) {
      const result = NewCommissionService.calculateCommissions(
        testCase.subtotal,
        testCase.deliveryFee
      );

      const passed = 
        result.business === testCase.expected.business &&
        result.driver === testCase.expected.driver &&
        result.nemy === testCase.expected.nemy &&
        result.total === testCase.expected.total;

      this.results.push({
        testName: `Comisiones: ${testCase.name}`,
        passed,
        expected: testCase.expected,
        actual: result,
        details: passed ? '✅ Correcto' : '❌ Error en cálculo'
      });

      console.log(`\n📊 ${testCase.name}`);
      console.log(`   Subtotal: $${(testCase.subtotal / 100).toFixed(2)}`);
      console.log(`   Delivery: $${(testCase.deliveryFee / 100).toFixed(2)}`);
      console.log(`   Negocio recibe: $${(result.business / 100).toFixed(2)} ${result.business === testCase.expected.business ? '✅' : '❌'}`);
      console.log(`   Repartidor recibe: $${(result.driver / 100).toFixed(2)} ${result.driver === testCase.expected.driver ? '✅' : '❌'}`);
      console.log(`   NEMY recibe: $${(result.nemy / 100).toFixed(2)} ${result.nemy === testCase.expected.nemy ? '✅' : '❌'}`);
      console.log(`   Total cliente paga: $${(result.total / 100).toFixed(2)} ${result.total === testCase.expected.total ? '✅' : '❌'}`);
    }
  }

  // ============================================
  // TEST 2: FLUJO COMPLETO PEDIDO EN EFECTIVO
  // ============================================
  async testCashOrderFlow() {
    console.log('\n🧪 TEST 2: Flujo Completo Pedido en Efectivo');
    console.log('='.repeat(60));

    const subtotal = 8500;
    const deliveryFee = 2500;
    const commissions = NewCommissionService.calculateCommissions(subtotal, deliveryFee);

    console.log('\n📦 ESCENARIO: Pedido en efectivo');
    console.log(`   Cliente paga: $${(commissions.total / 100).toFixed(2)} en efectivo`);
    console.log(`   Productos: $${(subtotal / 100).toFixed(2)}`);
    console.log(`   Delivery: $${(deliveryFee / 100).toFixed(2)}`);
    console.log(`   Comisión NEMY: $${(commissions.nemy / 100).toFixed(2)}`);

    console.log('\n💰 DISTRIBUCIÓN ESPERADA:');
    console.log(`   1. Repartidor recibe: $${(commissions.total / 100).toFixed(2)} del cliente`);
    console.log(`   2. Repartidor se queda: $${(commissions.driver / 100).toFixed(2)} (su delivery fee)`);
    console.log(`   3. Repartidor debe liquidar: $${((commissions.business + commissions.nemy) / 100).toFixed(2)}`);
    console.log(`      - Al negocio: $${(commissions.business / 100).toFixed(2)}`);
    console.log(`      - A NEMY: $${(commissions.nemy / 100).toFixed(2)}`);

    const driverKeeps = commissions.driver;
    const driverOwes = commissions.business + commissions.nemy;
    const totalReceived = commissions.total;

    const balanceCorrect = (driverKeeps + driverOwes) === totalReceived;

    this.results.push({
      testName: 'Flujo efectivo: Balance correcto',
      passed: balanceCorrect,
      expected: totalReceived,
      actual: driverKeeps + driverOwes,
      details: balanceCorrect 
        ? '✅ El repartidor recibe, se queda con su parte y debe liquidar el resto correctamente'
        : '❌ Error: Los números no cuadran'
    });

    console.log(`\n🔍 VERIFICACIÓN:`);
    console.log(`   Repartidor recibe: $${(totalReceived / 100).toFixed(2)}`);
    console.log(`   Repartidor se queda: $${(driverKeeps / 100).toFixed(2)}`);
    console.log(`   Repartidor debe: $${(driverOwes / 100).toFixed(2)}`);
    console.log(`   Balance: ${balanceCorrect ? '✅ CORRECTO' : '❌ ERROR'}`);
  }

  // ============================================
  // TEST 3: FLUJO COMPLETO PEDIDO CON TARJETA
  // ============================================
  async testCardOrderFlow() {
    console.log('\n🧪 TEST 3: Flujo Completo Pedido con Tarjeta');
    console.log('='.repeat(60));

    const subtotal = 8500;
    const deliveryFee = 2500;
    const commissions = NewCommissionService.calculateCommissions(subtotal, deliveryFee);

    console.log('\n💳 ESCENARIO: Pedido con tarjeta');
    console.log(`   Cliente paga: $${(commissions.total / 100).toFixed(2)} con tarjeta`);

    const totalDistributed = commissions.business + commissions.driver + commissions.nemy;
    const distributionCorrect = totalDistributed === commissions.total;

    this.results.push({
      testName: 'Flujo tarjeta: Distribución correcta',
      passed: distributionCorrect,
      expected: commissions.total,
      actual: totalDistributed
    });

    console.log(`   Balance: ${distributionCorrect ? '✅ CORRECTO' : '❌ ERROR'}`);
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 PRUEBAS EXTENSIVAS DEL MODELO DE EFECTIVO Y COMISIONES');
    console.log('='.repeat(60));

    await this.testBasicCommissions();
    await this.testCashOrderFlow();
    await this.testCardOrderFlow();

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\n✅ Pasadas: ${passed}/${total}`);
    console.log(`❌ Fallidas: ${failed}/${total}`);
    console.log(`📈 Porcentaje: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`\n   ${r.testName}`);
          console.log(`   Esperado: ${JSON.stringify(r.expected)}`);
          console.log(`   Actual: ${JSON.stringify(r.actual)}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log(failed === 0 ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON');
    console.log('='.repeat(60) + '\n');
  }
}

export async function runCashFlowTests() {
  const tester = new CashFlowTester();
  await tester.runAllTests();
}

if (require.main === module) {
  runCashFlowTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error ejecutando pruebas:', error);
      process.exit(1);
    });
}
