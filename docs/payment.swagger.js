/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Seller and Admin Payment Management
 */

/**
 * @swagger
 * /api/payments/seller/create-stripe-account:
 *   post:
 *     summary: Create seller Stripe account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Stripe account created successfully
 */

/**
 * @swagger
 * /api/payments/seller/activate-stripe/{activeCode}:
 *   patch:
 *     summary: Activate seller Stripe account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: activeCode
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Account activated
 */

/**
 * @swagger
 * /api/payments/seller/payment-details/{sellerId}:
 *   get:
 *     summary: Get seller payment details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/payments/seller/withdrawal-request:
 *   post:
 *     summary: Create withdrawal request
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/payments/admin/pending-withdrawals:
 *   get:
 *     summary: Get all pending withdrawal requests
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/payments/admin/confirm-withdrawal:
 *   patch:
 *     summary: Admin confirms withdrawal request
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
