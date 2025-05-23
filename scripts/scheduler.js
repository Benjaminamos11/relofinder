const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Schedule the job to run weekly (every Monday at 1 AM)
// Format: sec min hour day-of-month month day-of-week
// * * * * * = run every minute (for testing)
// 0 1 * * 1 = run at 1 AM every Monday

console.log('Starting the review update scheduler...');

cron.schedule('0 1 * * 1', () => {
  const scriptPath = path.join(__dirname, 'fetch-reviews.js');
  console.log(`${new Date().toISOString()}: Running review fetch job...`);
  
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing fetch script: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
    }
    
    console.log(`Script stdout: ${stdout}`);
    console.log(`${new Date().toISOString()}: Review fetch job completed.`);
  });
});

console.log('Review update scheduler started. Reviews will be fetched every Monday at 1 AM.');
console.log('Keep this process running to maintain the schedule (use a process manager like PM2 in production).');
console.log('Press Ctrl+C to exit.'); 