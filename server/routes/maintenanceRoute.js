const express = require('express');
const multer = require('multer');
const readXlsxFile = require('read-excel-file/node');
const { addMaintenance } = require('../controllers/maintenanceController');
const  maintenanceController  = require('../controllers/maintenanceController')

const upload = multer({ dest: 'uploads/' }); // Store uploaded files temporarily
const router = express.Router();

// Middleware to parse Excel files
const excelParser = (req, res, next) => {
    if (!req.file) {
        return next(new Error('No file uploaded'));
    }

    const path = './uploads/' + req.file.filename;
    readXlsxFile(path).then((rows) => {
        // Assume first row is headers and data starts from the second row
        const data = rows.slice(1).map(row => ({
            // memberCode: row[0],
            name: row[0],
            dividend: row[1]
        }));
        req.body.data = data;  // Attach parsed data to request body
        next(); // Proceed to the next middleware or route handler
    }).catch(err => {
        next(err); // Pass errors to Express error handling
    });
};

// Route to handle file uploads and data processing
router.post('/maintenance', upload.single('file'), excelParser, addMaintenance);
router.get('/maintenance', maintenanceController.getAllData)


// Catch-all error handler for this router
router.use((err, req, res, next) => {
    console.error('Error during processing:', err);  // Log error details for debugging
    res.status(500).json({
        message: err.message || 'An error occurred during processing.'
    });
});

module.exports = router;
