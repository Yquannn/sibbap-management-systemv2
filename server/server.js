const express = require('express');
const cors = require('cors');
require('dotenv').config();

const memberRoutes = require('./routes/memberRoutes');
const userRoutes = require('./routes/userRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const authRoutes = require('./routes/authRoutes')
const maintenanceRoute = require('./routes/maintenanceRoute')
const savingsRoute = require('./routes/savingsRoutes')
const timedepositRoute = require('./routes/timeDepositRoute')
const memberAuthRoutes = require('./routes/memberAuthRoutes');
const loanApplicationRoutes = require('./routes/loanApplicationRoutes');
const installmentRoutes = require('./routes/installmentRoutes')
const login = require('./routes/authRoutes')
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api', memberRoutes);
app.use('/api', userRoutes);
app.use('/api', announcementRoutes);
app.use('/api', savingsRoute)
app.use('/api', authRoutes)
app.use('/api', maintenanceRoute)
app.use('/api', timedepositRoute)
app.use('/api', memberAuthRoutes)
app.use('/api', loanApplicationRoutes);
app.use('/api', installmentRoutes);





app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
