const { pool } = require('../config/db');

const seedCompanies = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Clearing existing companies table...');
    await connection.query('DELETE FROM companies');
    await connection.query('ALTER TABLE companies AUTO_INCREMENT = 1');

    const sampleCompanies = [
      {
        name: 'Agarwal Packers & Movers',
        cities: JSON.stringify(['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Noida', 'Gurgaon']),
        services: JSON.stringify(['Home Relocation', 'Vehicle Transport', 'Office Relocation']),
        rating: 4.8,
        phone: '9810012345',
        email: 'support@agarwalpackers.com'
      },
      {
        name: 'Gati KWE Express Relocations',
        cities: JSON.stringify(['Mumbai', 'Delhi', 'Kolkata', 'Ahmedabad', 'Pune', 'Surat']),
        services: JSON.stringify(['Home Relocation', 'Commercial Goods', 'Office Relocation']),
        rating: 4.6,
        phone: '9820023456',
        email: 'info@gatikwe.com'
      },
      {
        name: 'Porter Enterprise Logistics',
        cities: JSON.stringify(['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai']),
        services: JSON.stringify(['Home Relocation', 'Commercial Goods']),
        rating: 4.5,
        phone: '9830034567',
        email: 'contact@porter.in'
      },
      {
        name: 'SafeExpress Packers & Movers',
        cities: JSON.stringify(['Delhi', 'Chandigarh', 'Jaipur', 'Lucknow', 'Mumbai', 'Indore']),
        services: JSON.stringify(['Vehicle Transport', 'Commercial Goods', 'Home Relocation']),
        rating: 4.3,
        phone: '9840045678',
        email: 'care@safexpress.com'
      },
      {
        name: 'South Express Relocation Services',
        cities: JSON.stringify(['Chennai', 'Bangalore', 'Hyderabad', 'Kochi', 'Coimbatore', 'Mysore']),
        services: JSON.stringify(['Home Relocation', 'Vehicle Transport', 'Office Relocation']),
        rating: 4.7,
        phone: '9850056789',
        email: 'support@southexpress.com'
      },
      {
        name: 'Metro City Movers',
        cities: JSON.stringify(['Kolkata', 'Patna', 'Bhubaneswar', 'Delhi', 'Ranchi']),
        services: JSON.stringify(['Home Relocation', 'Office Relocation']),
        rating: 4.2,
        phone: '9860067890',
        email: 'help@metromovers.in'
      },
      {
        name: 'Speedy Auto Transporters',
        cities: JSON.stringify(['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad']),
        services: JSON.stringify(['Vehicle Transport']),
        rating: 4.9,
        phone: '9870078901',
        email: 'book@speedyauto.com'
      },
      {
        name: 'Crown Relocations India',
        cities: JSON.stringify(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Gurgaon', 'Pune', 'Chennai']),
        services: JSON.stringify(['Home Relocation', 'Office Relocation', 'Vehicle Transport', 'Commercial Goods']),
        rating: 4.9,
        phone: '9880089012',
        email: 'india@crownrelo.com'
      }
    ];

    for (const comp of sampleCompanies) {
      await connection.query(
        `INSERT INTO companies (company_name, coverage_cities, service_types, rating, contact_phone, email) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [comp.name, comp.cities, comp.services, comp.rating, comp.phone, comp.email]
      );
    }

    connection.release();
    console.log('Sample logistics companies seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedCompanies();
