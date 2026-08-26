import prisma from '../config/prisma.js';

export const getStoresForUser = async (req, res) => {
  const { search, sortBy = 'name', order = 'asc' } = req.query;
  const userId = req.user?.userId;

  try {
    const validSortFields = ['name', 'address', 'createdAt'];
    const isRatingSort = sortBy === 'rating';
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const where = {};
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: isRatingSort ? undefined : { [sortField]: sortOrder },
      include: {
        ratings: {
          select: {
            id: true,
            value: true,
            userId: true,
            updatedAt: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avgRating = totalRatings > 0
        ? Number((store.ratings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings).toFixed(1))
        : null;

      const userRatingObj = userId ? store.ratings.find(r => r.userId === userId) : null;
      const userRating = userRatingObj ? userRatingObj.value : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        owner: store.owner,
        totalRatings,
        overallRating: avgRating !== null ? avgRating : "No ratings yet",
        averageNumeric: avgRating !== null ? avgRating : 0,
        userSubmittedRating: userRating
      };
    });

    if (isRatingSort) {
      formattedStores.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.averageNumeric - b.averageNumeric
          : b.averageNumeric - a.averageNumeric;
      });
    }

    res.json(formattedStores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Failed to retrieve stores', error: error.message });
  }
};

export const submitRating = async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;
  const userId = req.user.userId;

  try {
    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Upsert rating (create or update existing rating for this user and store)
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      },
      update: {
        value: numericRating
      },
      create: {
        value: numericRating,
        userId,
        storeId
      }
    });

    // Calculate updated store average
    const allStoreRatings = await prisma.rating.findMany({
      where: { storeId }
    });

    const totalRatings = allStoreRatings.length;
    const avgRating = (allStoreRatings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings).toFixed(1);

    res.json({
      message: 'Rating submitted successfully',
      rating: savedRating,
      storeStats: {
        storeId,
        overallRating: Number(avgRating),
        totalRatings,
        userSubmittedRating: numericRating
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};
