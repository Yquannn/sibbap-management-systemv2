const findByEmail = require('../models/memberAuthModel'); // Import the model function
const jwt = require('jsonwebtoken');

// Authenticate member and return JWT token
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Call the findByEmail function
        const member = await findByEmail.findByEmail(email, password);
        
        if (!member) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Create JWT payload
        const payload = {
            member: {
                id: member.MemberId, // Use MemberId from the database
            },
        };

        // Generate JWT token
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // JWT secret key
            { expiresIn: '1h' }, // Token expiration time (1 hour)
            (err, token) => {
                if (err) throw err;
                res.json({ token }); // Send the token to the client
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
