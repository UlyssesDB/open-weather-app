// Script to kill any process running on port 3000
const { execSync } = require('child_process');

try {
  // For macOS and Linux
  if (process.platform === 'darwin' || process.platform === 'linux') {
    console.log('Attempting to kill process on port 3000...');
    try {
      const pid = execSync('lsof -i :3000 -t').toString().trim();
      if (pid) {
        execSync(`kill -9 ${pid}`);
        console.log(`Process ${pid} on port 3000 killed successfully.`);
      } else {
        console.log('No process found running on port 3000.');
      }
    } catch (e) {
      console.log('No process found running on port 3000.');
    }
  } 
  // For Windows
  else if (process.platform === 'win32') {
    console.log('Attempting to kill process on port 3000...');
    try {
      execSync('FOR /F "tokens=5" %P IN (\'netstat -ano ^| findstr :3000 ^| findstr LISTENING\') DO taskkill /F /PID %P');
      console.log('Process on port 3000 killed successfully.');
    } catch (e) {
      console.log('No process found running on port 3000 or failed to kill.');
    }
  }
} catch (error) {
  console.error('Error killing process:', error.message);
}
