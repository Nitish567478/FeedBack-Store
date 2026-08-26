import prisma from '../config/prisma.js';

export const getOwnerDashboard = async (req, res) => {
  const userId = req.user.userId;
  const { sortBy = 'updatedAt', order = 'desc', search } = req.query;

  try {
    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true
              }
            }
          },
          orderBy: sortBy === 'rating' ? { value: order.toLowerCase() === 'asc' ? 'asc' : 'desc' } : { updatedAt: order.toLowerCase() === 'asc' ? 'asc' : 'desc' }
        }
      }
    });

    if (!store) {
      return res.status(200).json({
        hasStore: false,
        message: 'No store registered yet for your owner account. You can register your store below.'
      });
    }

    let customerRatings = store.ratings.map(r => ({
      id: r.id,
      rating: r.value,
      updatedAt: r.updatedAt,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address
      }
    }));

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      customerRatings = customerRatings.filter(r =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        (r.user.address && r.user.address.toLowerCase().includes(q))
      );
    }

    // Sort by user fields if requested
    if (sortBy === 'name') {
      customerRatings.sort((a, b) =>
        order === 'asc' ? a.user.name.localeCompare(b.user.name) : b.user.name.localeCompare(a.user.name)
      );
    } else if (sortBy === 'email') {
      customerRatings.sort((a, b) =>
        order === 'asc' ? a.user.email.localeCompare(b.user.email) : b.user.email.localeCompare(a.user.email)
      );
    }

    const totalRatings = store.ratings.length;
    const averageRating = totalRatings > 0
      ? Number((store.ratings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings).toFixed(1))
      : 0;

    // Rating breakdown
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    store.ratings.forEach(r => {
      if (ratingDistribution[r.value] !== undefined) {
        ratingDistribution[r.value]++;
      }
    });

    res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt
      },
      metrics: {
        averageRating,
        totalRatings,
        ratingDistribution
      },
      customerRatings
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ message: 'Failed to retrieve owner dashboard data', error: error.message });
  }
};

export const createOrUpdateStore = async (req, res) => {
  const userId = req.user.userId;
  const { name, email, address } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Store Name is required.' });
  }

  const storeEmail = (email || req.user.email).toLowerCase().trim();
  const storeAddress = (address || 'Primary Business Address').trim();

  try {
    const existingStoreWithEmail = await prisma.store.findUnique({
      where: { email: storeEmail }
    });

    const currentOwnerStore = await prisma.store.findUnique({
      where: { ownerId: userId }
    });

    if (existingStoreWithEmail && (!currentOwnerStore || existingStoreWithEmail.id !== currentOwnerStore.id)) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    const savedStore = await prisma.store.upsert({
      where: { ownerId: userId },
      update: {
        name: name.trim(),
        email: storeEmail,
        address: storeAddress
      },
      create: {
        name: name.trim(),
        email: storeEmail,
        address: storeAddress,
        ownerId: userId
      }
    });

    res.json({
      message: currentOwnerStore ? 'Store updated successfully' : 'Store created successfully',
      store: savedStore
    });
  } catch (error) {
    console.error('Create or update store error:', error);
    res.status(500).json({ message: 'Failed to create or update store', error: error.message });
  }
};
