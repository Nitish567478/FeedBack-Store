import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'feedback_store_jwt_secret_key_secure_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    jwtSecret,
    { expiresIn }
  );
};

export const signup = async (req, res) => {
  const { name, email, password, address, accountType = 'NORMAL_USER', role, storeName, storeEmail, storeAddress } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const isOwner =
      accountType === 'STORE_OWNER' ||
      accountType === 'owner' ||
      role === 'owner' ||
      role === 'STORE_OWNER' ||
      Boolean(storeName && storeName.trim());

    if (isOwner) {
      const resolvedStoreName = storeName && storeName.trim() ? storeName.trim() : `${name}'s Store`;
      const sEmail = (storeEmail || email).toLowerCase().trim();
      const existingStore = await prisma.store.findUnique({
        where: { email: sEmail }
      });
      if (existingStore) {
        return res.status(409).json({ message: 'A store with this email already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (isOwner) {
      newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          address: address && address.trim() ? address.trim() : (storeAddress ? storeAddress.trim() : ''),
          role: 'STORE_OWNER',
          store: {
            create: {
              name: resolvedStoreName,
              email: (storeEmail || email).toLowerCase(),
              address: storeAddress && storeAddress.trim() ? storeAddress.trim() : (address ? address.trim() : '')
            }
          }
        },
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
              address: true
            }
          }
        }
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          address: address && address.trim() ? address.trim() : '',
          role: 'NORMAL_USER'
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
    }

    const token = generateToken(newUser);

    return res.status(201).json({
      message: isOwner ? 'Store Owner & Store registered successfully' : 'User registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        store: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            email: user.store.email,
            address: user.store.address
          }
        : null,
      createdAt: user.createdAt
    };

    return res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match.' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

export const getMe = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
            address: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to retrieve profile', error: error.message });
  }
};
