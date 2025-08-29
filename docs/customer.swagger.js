/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management API
 */

/**
 * @swagger
 * /api/v2/customers/me:
 *   get:
 *     summary: Get logged-in customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved
 */

/**
 * @swagger
 * /api/v2/customers/wishlist:
 *   get:
 *     summary: Get logged-in user's wishlist
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved
 *   post:
 *     summary: Add or remove a product to/from wishlist
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wishlist updated
 */

/**
 * @swagger
 * /api/v2/customers/cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved
 *   post:
 *     summary: Add or remove product in cart
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart updated
 */

/**
 * @swagger
 * /api/v2/customers/cart/increment/{productId}:
 *   patch:
 *     summary: Increment cart product quantity
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantity incremented
 */

/**
 * @swagger
 * /api/v2/customers/cart/decrement/{productId}:
 *   patch:
 *     summary: Decrement cart product quantity
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantity decremented
 */

/**
 * @swagger
 * /api/v2/customers/admin/customers:
 *   get:
 *     summary: Get all customers (admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
