/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: Admin management & dashboard APIs
 */

/**
 * @swagger
 * /api/v2/admins/me:
 *   get:
 *     summary: Get logged-in admin profile
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized - Missing/Invalid token
 *       403:
 *         description: Forbidden - Insufficient role
 */

/**
 * @swagger
 * /api/v2/admins/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                       example: 12500
 *                     totalOrders:
 *                       type: integer
 *                       example: 320
 *       401:
 *         description: Unauthorized - Missing/Invalid token
 *       403:
 *         description: Forbidden - Insufficient role
 */
