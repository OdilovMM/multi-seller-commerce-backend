/**
 * @swagger
 * tags:
 *   name: Banners
 *   description: Banner management API (Admin restricted for create & update)
 */

/**
 * @swagger
 * /api/v2/banners:
 *   get:
 *     summary: Get all banners
 *     tags: [Banners]
 *     responses:
 *       200:
 *         description: List of banners
 *   post:
 *     summary: Create a new banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - mainban
 *             properties:
 *               productId:
 *                 type: string
 *                 description: MongoDB ObjectId of the product
 *               mainban:
 *                 type: string
 *                 format: binary
 *                 description: Banner image file
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       401:
 *         description: Unauthorized (No token provided)
 *       403:
 *         description: Forbidden (Not an admin)
 *
 * /api/v2/banners/product/{productId}:
 *   get:
 *     summary: Get banner by productId
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f77d9c5c1b2e00123abc45
 *     responses:
 *       200:
 *         description: Banner retrieved
 *       404:
 *         description: Banner not found
 *
 * /api/v2/banners/{bannerId}:
 *   patch:
 *     summary: Update a banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f77d9c5c1b2e00123abc45
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mainban
 *             properties:
 *               mainban:
 *                 type: string
 *                 format: binary
 *                 description: New banner image file
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       401:
 *         description: Unauthorized (No token provided)
 *       403:
 *         description: Forbidden (Not an admin)
 *       404:
 *         description: Banner not found
 */
