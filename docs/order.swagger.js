/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer, Seller, and Admin Orders Management
 */

/**
 * CUSTOMER ROUTES
 */

/**
 * @swagger
 * /api/orders/customer:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 */

/**
 * @swagger
 * /api/orders/customer/{userId}:
 *   get:
 *     summary: Get customer orders by status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         description: pending | canceled | all
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customer orders
 */

/**
 * @swagger
 * /api/orders/customer/detail/{orderId}:
 *   get:
 *     summary: Get customer single order detail
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer order detail
 */

/**
 * @swagger
 * /api/orders/customer/payment:
 *   post:
 *     summary: Create Stripe payment intent
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Stripe payment client secret
 */

/**
 * @swagger
 * /api/orders/customer/confirm/{orderId}:
 *   get:
 *     summary: Confirm customer order payment
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 */

/**
 * @swagger
 * /api/orders/customer/dashboard/{userId}:
 *   get:
 *     summary: Get customer dashboard data
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer dashboard data
 */

/**
 * SELLER ROUTES
 */

/**
 * @swagger
 * /api/orders/seller/{sellerId}:
 *   get:
 *     summary: Get seller orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sellerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: perPage
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller order list
 */

/**
 * @swagger
 * /api/orders/seller/detail/{orderId}:
 *   get:
 *     summary: Get seller single order detail
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller order detail
 */

/**
 * @swagger
 * /api/orders/seller/{orderId}/status:
 *   patch:
 *     summary: Update seller order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller order status updated
 */

/**
 * ADMIN ROUTES
 */

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Get all orders for admin
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *       - name: perPage
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin order list
 */

/**
 * @swagger
 * /api/orders/admin/detail/{orderId}:
 *   get:
 *     summary: Get admin single order detail
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin order detail
 */

/**
 * @swagger
 * /api/orders/admin/{orderId}/status:
 *   patch:
 *     summary: Update admin order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin order status updated
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
