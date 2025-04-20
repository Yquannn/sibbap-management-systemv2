const Rollover = require('../models/Rollover');

// Self-invoking async function
(async () => {
  try {
    console.log('Starting maturity update process...');
    const result = await Rollover.processMaturityUpdates();
    console.log('Maturity update completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error running maturity update process:', error);
    process.exit(1);
  }
})();