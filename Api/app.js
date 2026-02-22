const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/modules/auth/auth.routes');
const roomRoutes = require('./src/modules/rooms/rooms.routes');
const inventoryRoutes = require('./src/modules/inventory/inventory.routes');
const employeeRoutes = require('./src/modules/employees/employees.routes');
const housekeepingRoutes = require('./src/modules/housekeeping/housekeeping.routes');
const reportRoutes = require('./src/modules/reports/reports.routes');
const attendanceRoutes = require('./src/modules/attendance/attendance.routes');
const newsRoutes = require('./src/modules/news/news.routes');
const adsRoutes = require('./src/modules/ads/ads.routes');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'LMS API',
            version: '1.0.0',
            description: 'Lodge Management System API Documentation',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
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
    apis: ['./src/modules/**/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ads', adsRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

module.exports = app;
