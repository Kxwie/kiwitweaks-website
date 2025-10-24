/**
 * Payment Validation Schemas
 */

const Joi = require('joi');

/**
 * Stripe checkout schema
 */
const stripeCheckoutSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  plan: Joi.string()
    .valid('premium', 'pro', 'enterprise')
    .default('premium')
    .messages({
      'any.only': 'Invalid plan selected'
    }),

  successUrl: Joi.string()
    .uri()
    .optional(),

  cancelUrl: Joi.string()
    .uri()
    .optional()
});

/**
 * PayPal order creation schema
 */
const paypalCreateSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  plan: Joi.string()
    .valid('premium', 'pro', 'enterprise')
    .default('premium')
    .messages({
      'any.only': 'Invalid plan selected'
    })
});

/**
 * PayPal order capture schema
 */
const paypalCaptureSchema = Joi.object({
  orderId: Joi.string()
    .required()
    .messages({
      'any.required': 'Order ID is required'
    })
});

module.exports = {
  stripeCheckoutSchema,
  paypalCreateSchema,
  paypalCaptureSchema
};
