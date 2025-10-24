/**
 * Authentication Validation Schemas
 * Using Joi for robust input validation
 */

const Joi = require('joi');
const { isCommonPassword } = require('../middleware/validate');

/**
 * Registration schema
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .custom((value, helpers) => {
      if (isCommonPassword(value)) {
        return helpers.error('password.common');
      }
      return value;
    })
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'password.common': 'This password is too common. Please choose a stronger password',
      'any.required': 'Password is required'
    }),

  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .optional()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters'
    }),

  terms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must accept the Terms of Service',
      'any.required': 'You must accept the Terms of Service'
    })
});

/**
 * Login schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    }),

  remember: Joi.boolean()
    .optional()
    .default(false)
});

/**
 * Password reset request schema
 */
const passwordResetRequestSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
});

/**
 * Password reset confirmation schema
 */
const passwordResetConfirmSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .custom((value, helpers) => {
      if (isCommonPassword(value)) {
        return helpers.error('password.common');
      }
      return value;
    })
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'password.common': 'This password is too common',
      'any.required': 'Password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

/**
 * Email verification schema
 */
const emailVerifySchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required'
    })
});

/**
 * Change password schema (for authenticated users)
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .invalid(Joi.ref('currentPassword'))
    .custom((value, helpers) => {
      if (isCommonPassword(value)) {
        return helpers.error('password.common');
      }
      return value;
    })
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.invalid': 'New password must be different from current password',
      'password.common': 'This password is too common',
      'any.required': 'New password is required'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  emailVerifySchema,
  changePasswordSchema
};
