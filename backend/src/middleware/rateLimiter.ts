import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 *
 * Protects the API from abuse by limiting the number of requests
 * a client can make within a specified time window.
 */

/**
 * General API rate limiter
 * - 100 requests per 15 minutes per IP
 * - Applies to most endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Authentication rate limiter
 * - 5 requests per 15 minutes per IP
 * - Applies to login and registration endpoints
 * - More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Gmail API rate limiter
 * - 60 requests per minute per IP
 * - Matches Google's Gmail API quota limits
 * - Prevents exceeding Google's API quotas
 */
export const gmailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: 'Gmail API rate limit exceeded. Please slow down your requests.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Calendar API rate limiter
 * - 60 requests per minute per IP
 * - Matches Google's Calendar API quota limits
 * - Prevents exceeding Google's API quotas
 */
export const calendarLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute
  message: {
    error: 'Calendar API rate limit exceeded. Please slow down your requests.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI Copilot rate limiter
 * - 20 requests per 5 minutes per IP
 * - AI operations are computationally expensive
 * - Prevents abuse of AI endpoints
 */
export const aiCopilotLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 requests per 5 minutes
  message: {
    error: 'AI Copilot rate limit exceeded. Please try again later.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiter
 * - 10 uploads per hour per IP
 * - File uploads are resource intensive
 * - Prevents storage abuse
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Upload rate limit exceeded. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Webhook rate limiter
 * - 100 requests per minute per IP
 * - Webhooks can be high volume
 * - More lenient to handle legitimate webhook traffic
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: 'Webhook rate limit exceeded.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
