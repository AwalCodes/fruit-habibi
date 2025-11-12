import { z } from 'zod';

/**
 * Validation schemas for common inputs
 */

// UUID validation
export const uuidSchema = z.string().uuid('Invalid ID format');

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Product validation
export const productIdSchema = uuidSchema;
export const productCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  price_usd: z.number().positive('Price must be positive').max(1000000, 'Price is too high'),
  quantity: z.number().int().positive('Quantity must be a positive integer').max(1000000),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must be less than 50 characters'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  images: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

// Order validation
export const orderIdSchema = uuidSchema;
export const orderCreateSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().positive('Quantity must be a positive integer').max(10000),
  shippingAddress: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    address: z.string().min(1, 'Address is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    country: z.string().min(1, 'Country is required').max(100),
    postalCode: z.string().max(20).optional(),
  }),
});

// Escrow validation
export const escrowActionSchema = z.object({
  action: z.enum(['release', 'refund', 'freeze', 'status', 'transactions', 'seller_summary']),
  orderId: uuidSchema.optional(),
  reason: z.string().max(1000, 'Reason must be less than 1000 characters').optional(),
  processedBy: uuidSchema.optional(),
});

// Payment validation
export const paymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  orderId: uuidSchema,
});

// Message validation
export const messageSchema = z.object({
  product_id: uuidSchema,
  receiver_id: uuidSchema,
  body: z.string().min(1, 'Message body is required').max(2000, 'Message must be less than 2000 characters'),
});

// User validation
export const userUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters').optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').optional(),
});

// Search validation
export const searchQuerySchema = z.object({
  query: z.string().max(200, 'Search query must be less than 200 characters').optional(),
  category: z.string().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  location: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().max(1000).optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Sanitize object recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized: any = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    } else if (Array.isArray(sanitized[key])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sanitized[key] = (sanitized[key] as any[]).map((item: unknown) => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : 
        item
      );
    }
  }

  return sanitized as T;
}

/**
 * Validate and parse request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: z.ZodIssue) => e.message);
      throw new Error(`Validation error: ${messages.join(', ')}`);
    }
    throw new Error('Invalid request body');
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e: z.ZodIssue) => e.message);
      throw new Error(`Validation error: ${messages.join(', ')}`);
    }
    throw new Error('Invalid query parameters');
  }
}

/**
 * Validate UUID
 */
export function validateUUID(id: string): boolean {
  return uuidSchema.safeParse(id).success;
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up old rate limit records
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute

