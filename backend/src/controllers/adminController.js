import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings, roleCounts] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true }
      })
    ]);

    const rolesBreakdown = roleCounts.reduce((acc, curr) => {
      acc[curr.role] = curr._count._all;
      return acc;
    }, { ADMIN: 0, NORMAL_USER: 0, STORE_OWNER: 0 });

    res.json({
      totalUsers,
      totalStores,
      totalRatings,
      users_count: totalUsers,
      stores_count: totalStores,
      ratings_count: totalRatings,
      rolesBreakdown
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard stats', error: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, address, role = 'NORMAL_USER' } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

export const createStore = async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  try {
    // Check if store email is already taken
    const existingStoreEmail = await prisma.store.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingStoreEmail) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { store: true }
    });

    if (!owner) {
      return res.status(404).json({ message: 'Assigned owner user not found.' });
    }

    // Check if owner already owns a store
    if (owner.store) {
      return res.status(400).json({ message: 'This user already owns an existing store. Each store owner can only manage one store.' });
    }

    // Update user role to STORE_OWNER if not already
    if (owner.role !== 'STORE_OWNER') {
      await prisma.user.update({
        where: { id: ownerId },
        data: { role: 'STORE_OWNER' }
      });
    }

    const newStore = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: newStore
    });
  } catch (error) {
    console.error('Admin create store error:', error);
    res.status(500).json({ message: 'Failed to create store', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  const { search, role, sortBy = 'createdAt', order = 'desc' } = req.query;

  try {
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {};

    if (role && ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: { value: true }
            }
          }
        }
      }
    });

    // Format response: if user is STORE_OWNER, compute their store's overall rating
    const formattedUsers = users.map(user => {
      let storeRating = null;
      let storeInfo = null;

      if (user.store) {
        const totalRatings = user.store.ratings.length;
        const avg = totalRatings > 0
          ? Number((user.store.ratings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings).toFixed(1))
          : 0;

        storeRating = {
          average: avg,
          totalRatings,
          display: totalRatings > 0 ? `${avg} ★ (${totalRatings})` : 'No ratings yet'
        };

        storeInfo = {
          id: user.store.id,
          name: user.store.name,
          email: user.store.email
        };
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeInfo,
        storeRating
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
  }
};

export const getStores = async (req, res) => {
  const { search, sortBy = 'createdAt', order = 'desc' } = req.query;

  try {
    const validSortFields = ['name', 'email', 'address', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {};
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: sortBy === 'rating' ? undefined : { [sortField]: sortOrder },
      include: {
        owner: {
          select: { id: true, name: true, email: true, address: true }
        },
        ratings: {
          select: { value: true }
        }
      }
    });

    const formattedStores = stores.map(store => {
      const totalRatings = store.ratings.length;
      const avg = totalRatings > 0
        ? Number((store.ratings.reduce((acc, curr) => acc + curr.value, 0) / totalRatings).toFixed(1))
        : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        createdAt: store.createdAt,
        owner: store.owner,
        averageRating: avg,
        totalRatings,
        ratingDisplay: totalRatings > 0 ? `${avg}` : 'No ratings'
      };
    });

    // If sorting by rating
    if (sortBy === 'rating') {
      formattedStores.sort((a, b) => {
        return sortOrder === 'asc'
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating;
      });
    }

    res.json(formattedStores);
  } catch (error) {
    console.error('Admin get stores error:', error);
    res.status(500).json({ message: 'Failed to retrieve stores', error: error.message });
  }
};
