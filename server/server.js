const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const memberRoutes = require('./routes/memberRoutes');
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const authRoutes = require('./routes/authRoutes');
const maintenanceRoute = require('./routes/maintenanceRoute');
const savingsRoute = require('./routes/savingsRoutes');
const timedepositRoute = require('./routes/timeDepositRoute');
const memberAuthRoutes = require('./routes/memberAuthRoutes');
const loanApplicationRoutes = require('./routes/loanApplicationRoutes');
const installmentRoutes = require('./routes/installmentRoutes');
const notification = require('./routes/notificationRoutes'); // FIXED THIS LINE
const savingsSummary = require('./routes/savingsDashboardRoutes'); // FIXED THIS LINE
const loanDashboardRoutes = require('./routes/loanDashboardRoutes'); // FIXED THIS LINE
const timedepositRoutes = require('./routes/timedepositTransactionRoutes'); // FIXED THIS LINE
const timedepositRolloverRoutes = require('./routes/timedepositRolloverRoutes'); // FIXED THIS LINE
const memberMaintenanceRoutes = require('./routes/memberMaintenanceRoute'); // FIXED THIS LINE
const savingsMaintenanceRoutes = require('./routes/savingsMaintenanceRoutes'); // FIXED THIS LINE
const shareCapitalRoutes = require('./routes/shareCapitalRoutes'); // FIXED THIS LINE
const dashboardRoutes = require('./routes/dashboardRoutes'); // FIXED THIS LINE
const loanHistoryRoutes = require('./routes/loanHistoryRoutes'); // FIXED THIS LINE
const loanFactorRoutes = require('./routes/loanFactorRoutes'); // FIXED THIS LINE
const loanTypeRoutes = require('./routes/loanTypeRoutes'); // FIXED THIS LINE 
const reportRoutes = require('./routes/reportRoutes'); // FIXED THIS LINE

const settingsRoutes = require('./routes/kalingaFundSettings.routes');
const contributionsRoutes = require('./routes/kalingaContribution.routes');
const claimsRoutes = require('./routes/kalingaClaims.routes');


// Add to your main app.js or index.js
const pushNotificationRoutes = require('./routes/pushNotificationRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const { report } = require('process');

const app = express();
const PORT = process.env.PORT || 3001; // FIXED THIS LINE

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
app.use('/api', savingsRoute);
app.use('/api', authRoutes);
app.use('/api', maintenanceRoute);
app.use('/api', timedepositRoute);
app.use('/api', memberAuthRoutes);
app.use('/api', loanApplicationRoutes);
app.use('/api', installmentRoutes);
app.use('/api', notification);
app.use('/api', savingsSummary);
app.use('/api', loanDashboardRoutes); 
app.use('/api', timedepositRoutes);
app.use('/api', timedepositRolloverRoutes); // FIXED THIS LINE
app.use('/api', memberMaintenanceRoutes); // FIXED THIS LINE
app.use('/api', savingsMaintenanceRoutes); // FIXED THIS LINE
app.use('/api', shareCapitalRoutes); // FIXED THIS LINE
app.use('/api', dashboardRoutes); // FIXED THIS LINE
app.use('/api', loanHistoryRoutes);
app.use('/api', loanFactorRoutes); // FIXED THIS LINE
app.use('/api', settingsRoutes);
app.use('/api', contributionsRoutes);
app.use('/api', claimsRoutes);
app.use('/api', reportRoutes); // FIXED THIS LINE
app.use('/api', loanTypeRoutes); // FIXED THIS LINE



app.use('/api', pushNotificationRoutes);
app.use('/api', subscriptionRoutes);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
