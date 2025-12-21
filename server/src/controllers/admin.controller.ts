import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.model';
import Subscription from '../models/Subscription.model';
import Property from '../models/Property.model';
import { processPDFFile } from '../services/pdf.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as XLSX from 'xlsx';

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `property-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * Upload and process PDF file
 */
export const uploadPDF = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Process PDF
    const result = await processPDFFile(filePath, fileName);

    res.json({
      message: 'PDF processed successfully',
      saved: result.saved,
      errors: result.errors,
      fileName,
    });
  } catch (error: any) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      message: 'Error processing PDF',
      error: error.message,
    });
  }
};

/**
 * Get all users
 */
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { fullName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phoneNumber: new RegExp(search as string, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * Get all subscriptions
 */
export const getSubscriptions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};
    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { isActive: false },
        { expiryDate: { $lt: new Date() } },
      ];
    }

    const subscriptions = await Subscription.find(query)
      .populate('user', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      message: 'Error fetching subscriptions',
      error: error.message,
    });
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'broker' });
    const totalProperties = await Property.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      isActive: true,
      expiryDate: { $gt: new Date() },
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      $or: [{ isActive: false }, { expiryDate: { $lt: new Date() } }],
    });

    const revenue = await Subscription.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const recentUsers = await User.find({ role: 'broker' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email createdAt');

    res.json({
      stats: {
        totalUsers,
        totalProperties,
        activeSubscriptions,
        expiredSubscriptions,
        totalRevenue: revenue[0]?.total || 0,
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Download users Excel report
 */
export const downloadUsersReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({ role: 'broker' })
      .select('fullName email phoneNumber createdAt')
      .lean();

    const data = users.map((user) => ({
      'Full Name': user.fullName,
      'Email': user.email,
      'Phone Number': user.phoneNumber,
      'Created At': user.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-report-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('Download users report error:', error);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message,
    });
  }
};

/**
 * Download subscriptions Excel report
 */
export const downloadSubscriptionsReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'fullName email')
      .lean();

    const data = subscriptions.map((sub: any) => ({
      'User Name': sub.user?.fullName || 'N/A',
      'User Email': sub.user?.email || 'N/A',
      'Plan Type': sub.planType,
      'Amount': sub.amount,
      'Start Date': sub.startDate.toISOString(),
      'Expiry Date': sub.expiryDate.toISOString(),
      'Is Active': sub.isActive ? 'Yes' : 'No',
      'Created At': sub.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=subscriptions-report-${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('Download subscriptions report error:', error);
    res.status(500).json({
      message: 'Error generating report',
      error: error.message,
    });
  }
};

