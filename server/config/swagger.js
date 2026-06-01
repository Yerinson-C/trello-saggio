const version = require('../version');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      version,
      title: 'TRELLO SAGGIO API',
      description:
        'API documentation for TRELLO SAGGIO - Real-Time Collaborative Kanban Board Application',
      license: {
        name: 'Fair Use License',
        url: 'https://github.com/trello-saggionban/trello-saggio/blob/master/LICENSE.md',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Base path for API endpoints',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        apiKeyAuth: [],
      },
    ],
  },
  apis: ['./api/controllers/**/*.js', './api/models/*.js', './api/responses/*.js'],
};
