import prisma from './config/prisma.js';

async function testStoreQuery() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        ratings: true,
        owner: true
      }
    });
    console.log('Stores count:', stores.length);
    console.log('First store:', stores[0]?.name);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testStoreQuery();
