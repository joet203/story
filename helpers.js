const path = require("path");
const fs2 = require("fs");
const fs = require("fs").promises;
// Ensure log files and directories exist
const ensureDirectoriesExist = () => {
    const logFiles = ["request_log.txt", "error_log.txt", "id_counter.txt"];
    logFiles.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (!fs2.existsSync(filePath)) {
        fs2.writeFileSync(filePath, "");
      }
    });
  
    // Ensure the images directory exists
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs2.existsSync(imagesDir)) {
      fs2.mkdirSync(imagesDir, { recursive: true });
      console.log(`Created images directory at ${imagesDir}`);
    }
  
    // Ensure the stories directory exists
    const storiesDir = path.join(__dirname, 'stories');
    if (!fs2.existsSync(storiesDir)) {
      fs2.mkdirSync(storiesDir, { recursive: true });
      console.log(`Created stories directory at ${storiesDir}`);
    }
  };

  
// Function to get the next incrementing ID
async function getNextID() {
    const idFile = path.join(__dirname, 'id_counter.txt');
    let id = 0;
  
    try {
      const data = await fs.readFile(idFile, 'utf8');
      id = parseInt(data, 10);
      if (isNaN(id)) id = 0;
    } catch (err) {
      // File doesn't exist or couldn't be read, start from 0
      id = 0;
    }
    id += 1;
    await fs.writeFile(idFile, id.toString());
    return id;
  }

  
// Function to log the request details
async function logRequest(story) {
    const logFile = path.join(__dirname, "request_log.txt");
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "short",
      timeStyle: "short",
    });
  
    const logEntry = `${timestamp} - Story: "${story}"\n`;
  
    try {
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      console.error("Error writing to log file:", error);
      await logError(error);
    }
  }
  
  // Function to log errors
  async function logError(error) {
    const errorLogFile = path.join(__dirname, "error_log.txt");
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "short",
      timeStyle: "short",
    });
  
    const errorEntry = `${timestamp} - Error: ${error.stack || error}\n`;
  
    try {
      await fs.appendFile(errorLogFile, errorEntry);
    } catch (err) {
      console.error("Error writing to error log file:", err);
    }
  }
  
module.exports = { ensureDirectoriesExist, getNextID, logRequest, logError };