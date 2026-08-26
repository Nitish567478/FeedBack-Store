import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FeedBack Store database seeding...');

  // Clean up existing records in reverse dependency order
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Master', // 27 chars
      email: 'admin@feedbackstore.com',
      password: adminPassword,
      address: '100 Global Headquarters Blvd, Suite 500, Tech City, CA 94016',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Arthur Pendelton Store Manager', // 30 chars
      email: 'arthur.owner@gourmetgrocer.com',
      password: ownerPassword,
      address: '742 Evergreen Terrace, Sector 4, Springfield, OR 97477',
      role: 'STORE_OWNER'
    }
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Beatrix Kiddo Retail Director', // 29 chars
      email: 'beatrix.owner@cyberhub.com',
      password: ownerPassword,
      address: '88 Cyberpunk Arcade Way, Neo Tokyo District, WA 98101',
      role: 'STORE_OWNER'
    }
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Charles Montgomery Burns Jr', // 28 chars
      email: 'charles.owner@bookvault.com',
      password: ownerPassword,
      address: '1000 Luxury Estates Avenue, Penthouse B, NY 10021',
      role: 'STORE_OWNER'
    }
  });
  console.log('✅ Store Owners created');

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Grand Valley Gourmet Grocers',
      email: 'contact@gourmetgrocer.com',
      address: '1204 Valley Marketplace Highway, Suite A, Seattle, WA 98101',
      ownerId: owner1.id
    }
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Cybernetics Electronics Hub',
      email: 'support@cyberhub.com',
      address: '404 Silicon Boulevard, Downtown Tech Square, San Jose, CA 95113',
      ownerId: owner2.id
    }
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'The Vintage Bookstore & Cafe',
      email: 'hello@bookvault.com',
      address: '221B Baker Street Quarter, Old Town, Boston, MA 02108',
      ownerId: owner3.id
    }
  });
  console.log('✅ Stores created');

  // 4. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alexander Hamilton Smithson', // 28 chars
      email: 'alexander.smith@example.com',
      password: userPassword,
      address: '350 Fifth Avenue, Floor 14, Manhattan, NY 10118',
      role: 'NORMAL_USER'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Benjamin Franklin Rodriguez', // 28 chars
      email: 'benjamin.rodriguez@example.com',
      password: userPassword,
      address: '1776 Liberty Bell Way, Historic Quarter, Philadelphia, PA 19106',
      role: 'NORMAL_USER'
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Catherine Elizabeth Middleton', // 29 chars
      email: 'catherine.middleton@example.com',
      password: userPassword,
      address: '45 Kensington Palace Gardens, Royal District, London, UK',
      role: 'NORMAL_USER'
    }
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'David Jonathan Copperfield', // 27 chars
      email: 'david.copperfield@example.com',
      password: userPassword,
      address: '77 Magic Mountain Road, North Ridge, Denver, CO 80202',
      role: 'NORMAL_USER'
    }
  });
  console.log('✅ Normal Users created');

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, value: 5 },
      { userId: user2.id, storeId: store1.id, value: 4 },
      { userId: user3.id, storeId: store1.id, value: 5 },
      { userId: user4.id, storeId: store1.id, value: 4 },

      { userId: user1.id, storeId: store2.id, value: 3 },
      { userId: user2.id, storeId: store2.id, value: 4 },
      { userId: user3.id, storeId: store2.id, value: 2 },

      { userId: user1.id, storeId: store3.id, value: 5 },
      { userId: user4.id, storeId: store3.id, value: 5 }
    ]
  });
  console.log('✅ Sample store ratings created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n--- Test Credentials ---');
  console.log('Admin:       admin@feedbackstore.com / Admin@12345');
  console.log('Store Owner: arthur.owner@gourmetgrocer.com / Owner@12345');
  console.log('User:        alexander.smith@example.com / User@12345');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
