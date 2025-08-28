/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Customer product reviews management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - productId
 *         - firstName
 *         - rating
 *         - review
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated review ID
 *         productId:
 *           type: string
 *           description: The ID of the reviewed product
 *         firstName:
 *           type: string
 *           description: Customer's first name
 *           example: John
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating value (1-5)
 *           example: 5
 *         review:
 *           type: string
 *           description: Customer's written review
 *           example: "The product quality was excellent!"
 *         date:
 *           type: string
 *           format: date
 *           description: Date when review was created
 *       example:
 *         id: 64ec9b5f9d2f8e6a0a8a77b4
 *         productId: 64ec9a8a2b3c1a7e8d1f45b2
 *         firstName: "John"
 *         rating: 5
 *         review: "Great product, highly recommended!"
 *         date: "2025-08-28"
 */

/**
 * @swagger
 * /api/v2/reviews/add-customer-product-review:
 *   post:
 *     summary: Add a new product review (Customer only)
 *     description: Allows a customer to submit a review for a specific product.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - firstName
 *               - rating
 *               - review
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The product ID being reviewed
 *                 example: 64ec9a8a2b3c1a7e8d1f45b2
 *               firstName:
 *                 type: string
 *                 example: John
 *               rating:
 *                 type: number
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: "Fast delivery and very good quality."
 *     responses:
 *       201:
 *         description: Review successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: Review Added
 *       400:
 *         description: Bad request (validation error)
 *       401:
 *         description: Unauthorized (token missing or invalid)
 */

/**
 * @swagger
 * /api/v2/reviews/get-all-reviews/{productId}:
 *   get:
 *     summary: Get all reviews for a product
 *     description: Returns a paginated list of reviews and aggregated rating statistics.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: A list of reviews with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: success
 *                 data:
 *                   reviews:
 *                     - id: 64ec9b5f9d2f8e6a0a8a77b4
 *                       productId: 64ec9a8a2b3c1a7e8d1f45b2
 *                       firstName: "John"
 *                       rating: 5
 *                       review: "Great product!"
 *                       date: "August 28, 2025"
 *                   totalReviews: 12
 *                   ratingReview:
 *                     - rating: 5
 *                       sum: 8
 *                     - rating: 4
 *                       sum: 3
 *                     - rating: 3
 *                       sum: 1
 *                     - rating: 2
 *                       sum: 0
 *                     - rating: 1
 *                       sum: 0
 *       404:
 *         description: Product not found
 */
