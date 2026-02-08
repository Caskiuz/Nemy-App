// Agregar al final de routes.ts

// Auditoría rápida para testing
app.get('/api/audit/quick', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const checks = [];
    let allPassed = true;
    
    // 1. Verificar que hay pedidos
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    const hasOrders = orders[0].count > 0;
    checks.push({
      rule: 'Hay pedidos en el sistema',
      passed: hasOrders,
      details: `${orders[0].count} pedidos encontrados`
    });
    if (!hasOrders) allPassed = false;
    
    // 2. Verificar pagos vs pedidos
    const [payments] = await connection.execute('SELECT COUNT(*) as count FROM payments');
    const paymentsMatch = payments[0].count === orders[0].count;
    checks.push({
      rule: 'Pagos coinciden con pedidos',
      passed: paymentsMatch,
      details: `${payments[0].count} pagos vs ${orders[0].count} pedidos`
    });
    if (!paymentsMatch) allPassed = false;
    
    // 3. Verificar transacciones
    const [transactions] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
    const hasTransactions = transactions[0].count > 0;
    checks.push({
      rule: 'Se generaron transacciones',
      passed: hasTransactions,
      details: `${transactions[0].count} transacciones generadas`
    });
    if (!hasTransactions) allPassed = false;
    
    // 4. Verificar wallets con balance
    const [wallets] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM wallets 
      WHERE balance > 0 OR pending_balance > 0 OR total_earned > 0
    `);
    const walletsActive = wallets[0].count > 0;
    checks.push({
      rule: 'Wallets tienen movimientos',
      passed: walletsActive,
      details: `${wallets[0].count} wallets con actividad`
    });
    if (!walletsActive) allPassed = false;
    
    // 5. Verificar suma de comisiones
    const [commissions] = await connection.execute(`
      SELECT 
        SUM(platform_fee) as platform_total,
        SUM(business_amount) as business_total,
        SUM(driver_fee) as driver_total,
        SUM(total) as order_total
      FROM orders
    `);
    
    if (commissions[0].order_total > 0) {
      const totalCommissions = 
        parseFloat(commissions[0].platform_total || 0) +
        parseFloat(commissions[0].business_total || 0) +
        parseFloat(commissions[0].driver_total || 0);
      
      const orderTotal = parseFloat(commissions[0].order_total);
      const commissionsMatch = Math.abs(totalCommissions - orderTotal) < 0.01;
      
      checks.push({
        rule: 'Comisiones suman el total de pedidos',
        passed: commissionsMatch,
        details: `Comisiones: $${totalCommissions.toFixed(2)} vs Pedidos: $${orderTotal.toFixed(2)}`
      });
      if (!commissionsMatch) allPassed = false;
    }
    
    await connection.end();
    
    res.json({
      overall_status: allPassed ? 'PASSED' : 'FAILED',
      checks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en auditoría rápida:', error);
    res.status(500).json({ error: error.message });
  }
});