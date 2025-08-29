const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API Documentation',
			version: '1.0.0',
			description: 'E-commerce platform API docs',
		},
		servers: [
			{
				url: 'http://localhost:5000/api/v2',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	apis: ['./docs/*.swagger.js', './routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};

module.exports = swaggerDocs;
