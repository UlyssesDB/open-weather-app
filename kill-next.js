// Script to kill all Next.js processes
const { execSync } = require('child_process');

try {
  // For macOS and Linux
  if (process.platform === 'darwin' || process.platform === 'linux') {
    console.log('Attempting to kill all Next.js processes...');
    try {
      // Find and kill all processes with "next" in the command
      execSync('pkill -f next');
      console.log('All Next.js processes killed successfully.');
    } catch (e) {
      console.log('No Next.js processes found or failed to kill.');
    }
  } 
  // For Windows
  else if (process.platform === 'win32') {
    console.log('Attempting to kill all Next.js processes...');
    try {
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*"');
      console.log('All Next.js processes killed successfully.');
    } catch (e) {
      console.log('No Next.js processes found or failed to kill.');
    }
  }
} catch (error) {
  console.error('Error killing processes:', error.message);
}
