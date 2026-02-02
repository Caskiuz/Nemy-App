import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { businesses, products } from "../shared/schema-mysql";

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "137920",
  database: "nemy_db_local",
});

const db = drizzle(connection);

async function addRestaurantWithMenu() {
  try {
    const restaurants = [
      {
        business: {
          name: "Tacos El Güero",
          type: "restaurant",
          description: "Los mejores tacos de Autlán",
          image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
          address: "Av. Revolución 123, Centro, Autlán",
          phone: "+52 317 123 4567",
          deliveryFee: 2500,
          minOrder: 5000,
          isActive: true,
          isOpen: true,
          latitude: "20.0736",
          longitude: "-104.3647",
          categories: "tacos,mexicana,antojitos",
        },
        products: [
          { name: "Tacos de Birria (3 pzas)", description: "Tacos de birria con consomé", price: 8500, category: "Tacos", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400" },
          { name: "Tacos de Asada (3 pzas)", description: "Tacos de carne asada", price: 7500, category: "Tacos", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" },
          { name: "Tacos al Pastor (3 pzas)", description: "Tacos al pastor con piña", price: 7000, category: "Tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400" },
          { name: "Quesadilla de Queso", description: "Quesadilla de queso Oaxaca", price: 6000, category: "Quesadillas", image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400" },
        ],
      },
      {
        business: {
          name: "Burger House",
          type: "restaurant",
          description: "Hamburguesas artesanales",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
          address: "Calle Hidalgo 456, Autlán",
          phone: "+52 317 234 5678",
          deliveryFee: 3000,
          minOrder: 8000,
          isActive: true,
          isOpen: true,
          latitude: "20.0740",
          longitude: "-104.3650",
          categories: "burgers,hamburguesas,americana",
        },
        products: [
          { name: "Burger Clásica", description: "Hamburguesa con queso, lechuga y tomate", price: 9500, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
          { name: "Burger BBQ", description: "Hamburguesa con salsa BBQ y tocino", price: 11000, category: "Burgers", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400" },
          { name: "Burger Doble", description: "Doble carne con queso americano", price: 13500, category: "Burgers", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400" },
          { name: "Papas Fritas", description: "Papas crujientes", price: 4500, category: "Acompañamientos", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
        ],
      },
      {
        business: {
          name: "Pizza Napoli",
          type: "restaurant",
          description: "Auténtica pizza italiana",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
          address: "Av. Juárez 789, Autlán",
          phone: "+52 317 345 6789",
          deliveryFee: 3500,
          minOrder: 12000,
          isActive: true,
          isOpen: true,
          latitude: "20.0745",
          longitude: "-104.3655",
          categories: "pizza,italiana,pastas",
        },
        products: [
          { name: "Pizza Margherita", description: "Tomate, mozzarella y albahaca", price: 15000, category: "Pizza", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
          { name: "Pizza Pepperoni", description: "Pepperoni y queso mozzarella", price: 17000, category: "Pizza", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
          { name: "Pizza Hawaiana", description: "Jamón y piña", price: 16000, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
          { name: "Lasagna", description: "Lasagna casera con carne", price: 14000, category: "Pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400" },
        ],
      },
      {
        business: {
          name: "Sushi Zen",
          type: "restaurant",
          description: "Sushi fresco y delicioso",
          image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
          address: "Calle Morelos 321, Autlán",
          phone: "+52 317 456 7890",
          deliveryFee: 4000,
          minOrder: 15000,
          isActive: true,
          isOpen: true,
          latitude: "20.0750",
          longitude: "-104.3660",
          categories: "sushi,japonesa",
        },
        products: [
          { name: "Roll California", description: "Cangrejo, aguacate y pepino", price: 12000, category: "Sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
          { name: "Roll Philadelphia", description: "Salmón y queso crema", price: 14000, category: "Sushi", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400" },
          { name: "Sashimi Salmón", description: "Sashimi fresco de salmón", price: 16000, category: "Sashimi", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400" },
          { name: "Nigiri Atún", description: "Nigiri de atún fresco", price: 13000, category: "Nigiri", image: "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400" },
        ],
      },
      {
        business: {
          name: "Pollo Loco",
          type: "restaurant",
          description: "Pollo asado y rostizado",
          image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400",
          address: "Av. Independencia 654, Autlán",
          phone: "+52 317 567 8901",
          deliveryFee: 2500,
          minOrder: 7000,
          isActive: true,
          isOpen: true,
          latitude: "20.0755",
          longitude: "-104.3665",
          categories: "pollo,alitas",
        },
        products: [
          { name: "Pollo Entero", description: "Pollo rostizado completo", price: 15000, category: "Pollo", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400" },
          { name: "Medio Pollo", description: "Medio pollo con tortillas", price: 8500, category: "Pollo", image: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400" },
          { name: "Alitas BBQ", description: "Alitas con salsa BBQ", price: 9500, category: "Pollo", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400" },
          { name: "Ensalada César", description: "Ensalada con pollo", price: 7500, category: "Ensaladas", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400" },
        ],
      },
      {
        business: {
          name: "Mariscos El Puerto",
          type: "restaurant",
          description: "Mariscos frescos del pacífico",
          image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400",
          address: "Calle Zaragoza 987, Autlán",
          phone: "+52 317 678 9012",
          deliveryFee: 3500,
          minOrder: 10000,
          isActive: true,
          isOpen: true,
          latitude: "20.0760",
          longitude: "-104.3670",
          categories: "mariscos,pescado",
        },
        products: [
          { name: "Ceviche de Camarón", description: "Ceviche fresco con limón", price: 12000, category: "Mariscos", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523f?w=400" },
          { name: "Tostadas de Ceviche", description: "Tostadas con ceviche mixto", price: 10000, category: "Mariscos", image: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400" },
          { name: "Camarones al Mojo", description: "Camarones con ajo", price: 14000, category: "Mariscos", image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400" },
          { name: "Filete de Pescado", description: "Filete empanizado", price: 13000, category: "Mariscos", image: "https://images.unsplash.com/photo-1580959375944-0b7b2e7e4f3a?w=400" },
        ],
      },
    ];

    for (const restaurant of restaurants) {
      const [result] = await db.insert(businesses).values(restaurant.business);
      const businessId = result.insertId.toString();
      
      const menuItems = restaurant.products.map(p => ({
        ...p,
        businessId,
        isAvailable: true,
      }));
      
      await db.insert(products).values(menuItems);
      console.log(`✅ ${restaurant.business.name}: ${menuItems.length} productos`);
    }
    
    console.log("\n🎉 Todos los restaurantes creados exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addRestaurantWithMenu();
