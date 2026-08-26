import { body, validationResult } from 'express-validator';

// Standard error formatting middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return res.status(400).json({
      message: errorDetails[0]?.message || 'Validation failed',
      errors: errorDetails
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters long.'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid email address.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long.')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character (!@#$%^&*).'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors
];

export const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be 8-16 characters long.')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('New password must contain at least one uppercase letter and one special character (!@#$%^&*).'),
  handleValidationErrors
];

export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters long.'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters.'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid email address.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long.')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character (!@#$%^&*).'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, NORMAL_USER, or STORE_OWNER.'),
  handleValidationErrors
];

export const validateCreateStore = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Store name is required.')
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters.'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid store email address.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Store address is required.')
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters.'),
  body('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required.'),
  handleValidationErrors
];

export const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
  handleValidationErrors
];
