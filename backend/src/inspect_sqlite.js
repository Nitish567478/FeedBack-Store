import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectSqlite() {
  try {
    const users = await prisma.user.findMany({
      include: {
        store: true,
        ratings: true
      }
    });
    console.log(`\n=== USERS IN SQLITE (${users.length} rows) ===`);
    users.forEach(u => {
      console.log(`- [${u.role}] ${u.name} (${u.email}) | Store: ${u.store?.name || 'None'} | Ratings submitted: ${u.ratings?.length || 0}`);
    });

    const stores = await prisma.store.findMany({
      include: {
        owner: true,
        ratings: {
          include: {
            user: true
          }
        }
      }
    });
    console.log(`\n=== STORES IN SQLITE (${stores.length} rows) ===`);
    stores.forEach(s => {
      const avg = s.ratings.length ? (s.ratings.reduce((acc, r) => acc + r.value, 0) / s.ratings.length).toFixed(1) : 'No ratings';
      console.log(`- ${s.name} (${s.email}) | Address: ${s.address} | Owner: ${s.owner?.name} | Avg Rating: ${avg} (${s.ratings.length} ratings)`);
    });

    const ratings = await prisma.rating.findMany({
      include: {
        user: true,
        store: true
      }
    });
    console.log(`\n=== RATINGS IN SQLITE (${ratings.length} rows) ===`);
    ratings.forEach(r => {
      console.log(`- User: ${r.user?.name} rated Store: ${r.store?.name} => ${r.value} Stars`);
    });

  } catch (err) {
    console.error('Error reading sqlite:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSqlite();
