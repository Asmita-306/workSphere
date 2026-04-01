import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../prisma.config.cjs';

const prisma = new PrismaClient(config);

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // PostgreSQL uses integer IDs in this setup
      req.user = await prisma.user.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { id: true, name: true, email: true, role: true, totalLeaves: true, usedLeaves: true, managerId: true }
      });
      
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to access this resource` });
    }
    next();
  };
};
