/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management & browsing
 */

/**
 * @swagger
 * /api/v2/products:
 *   get:
 *     summary: Get products with filtering, sorting and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [priceAsc, priceDesc, latest]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product list with pagination
 *
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - brand
 *               - price
 *               - stock
 *               - description
 *               - shopName
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               shopName:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product successfully created
 *
 * /api/v2/products/{productId}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               discount: { type: number }
 *               stock: { type: number }
 *               brand: { type: string }
 *     responses:
 *       200:
 *         description: Product successfully updated
 *
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
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
 *         description: Product successfully deleted
 *
 * /api/v2/products/{productId}/image:
 *   patch:
 *     summary: Update a product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - oldImage
 *               - newImage
 *             properties:
 *               oldImage:
 *                 type: string
 *                 description: URL of old image
 *               newImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product image successfully updated
 *
 * /api/v2/products/my-products:
 *   get:
 *     summary: Get seller's own products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller's products
 *
 * /api/v2/products/price-range:
 *   get:
 *     summary: Get latest products and price range
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Products with min and max price
 *
 * /api/v2/products/home:
 *   get:
 *     summary: Get products for homepage (top rated & new arrivals)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Homepage products
 *
 * /api/v2/products/{slug}:
 *   get:
 *     summary: Get single product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product details with related products
 *
 * /api/v2/products/type/{type}:
 *   get:
 *     summary: Get products by type
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [top-rated, new-arrivals]
 *         required: true
 *     responses:
 *       200:
 *         description: Products by type
 */
