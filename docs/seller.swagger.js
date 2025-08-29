/**
 * @swagger
 * tags:
 *   name: Sellers
 *   description: Seller management API
 */

/**
 * @swagger
 * /api/v2/seller/me:
 *   get:
 *     summary: Get logged-in seller's profile
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller profile retrieved successfully
 *       401:
 *         description: Unauthorized, token missing or invalid
 */

/**
 * @swagger
 * /api/v2/seller/dashboard:
 *   get:
 *     summary: Get seller dashboard information
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard info retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v2/seller/profile-image:
 *   post:
 *     summary: Upload seller profile image
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: Invalid image
 */

/**
 * @swagger
 * /api/v2/seller/address:
 *   post:
 *     summary: Add or update seller address
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shopName
 *               - division
 *               - district
 *               - subDistrict
 *             properties:
 *               shopName:
 *                 type: string
 *               division:
 *                 type: string
 *               district:
 *                 type: string
 *               subDistrict:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seller address added/updated successfully
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/v2/seller/{sellerId}:
 *   get:
 *     summary: Get seller detail by ID
 *     tags: [Sellers]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller detail retrieved successfully
 *       404:
 *         description: Seller not found
 */

/**
 * @swagger
 * /api/v2/seller/status:
 *   patch:
 *     summary: Update seller status
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sellerId
 *               - status
 *             properties:
 *               sellerId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, active, deactive]
 *     responses:
 *       200:
 *         description: Seller status updated successfully
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
 * /api/v2/admin/sellers/active:
 *   get:
 *     summary: Get all active sellers (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search keyword
 *     responses:
 *       200:
 *         description: Active sellers retrieved successfully
 */

/**
 * @swagger
 * /api/v2/admin/sellers/deactive:
 *   get:
 *     summary: Get all deactive sellers (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search keyword
 *     responses:
 *       200:
 *         description: Deactive sellers retrieved successfully
 */

/**
 * @swagger
 * /api/v2/admin/sellers/activate-request:
 *   get:
 *     summary: Get pending activation sellers (admin only)
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: parPage
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search keyword
 *     responses:
 *       200:
 *         description: Pending activation sellers retrieved successfully
 */
