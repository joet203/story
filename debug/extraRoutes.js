const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Endpoint to display the log files' contents
router.get("/logs", async (req, res) => {
    try {
      const requestLog = await fs.readFile(path.join(__dirname, "request_log.txt"), "utf-8");
      const errorLog = await fs.readFile(path.join(__dirname, "error_log.txt"), "utf-8");
  
      const logsHtml = `
        <html>
          <head>
            <title>Server Logs</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                color: #333;
                padding: 20px;
              }
              h1 {
                color: #444;
              }
              .log-container {
                margin-bottom: 30px;
                padding: 10px;
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                max-height: 400px;
                overflow-y: auto;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <h1>Server Logs</h1>
            <div class="log-container">
              <h2>Request Log</h2>
              <pre>${requestLog}</pre>
            </div>
            <div class="log-container">
              <h2>Error Log</h2>
              <pre>${errorLog}</pre>
            </div>
          </body>
        </html>
      `;
      res.send(logsHtml);
    } catch (error) {
      console.error("Error reading log files:", error);
      res.status(500).send("An error occurred while reading the log files.");
    }
  });
  
  // Endpoint to display past stories and images
  router.get("/past-stories", async (req, res) => {
    try {
      const storiesDir = path.join(__dirname, 'stories');
      const imagesDir = path.join(__dirname, 'public', 'images');
  
      console.log(`Reading stories from: ${storiesDir}`);
      console.log(`Reading images from: ${imagesDir}`);
  
      const storyFiles = await fs.readdir(storiesDir);
      const imageFiles = await fs.readdir(imagesDir);
  
      console.log(`Found story files: ${storyFiles}`);
      console.log(`Found image files: ${imageFiles}`);
  
      const stories = storyFiles.filter(file => file.startsWith('story_') && file.endsWith('.txt'));
      const images = imageFiles.filter(file => file.startsWith('image_') && (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')));
  
      console.log(`Filtered story files: ${stories}`);
      console.log(`Filtered image files: ${images}`);
  
      const entries = [];
      for (const storyFile of stories) {
        const match = storyFile.match(/story_(\d+)\.txt/);
        if (!match) {
          console.log(`Skipping file with no ID match: ${storyFile}`);
          continue; // Skip files that don't have an ID
        }
        const id = match[1];
        const imageFile = images.find(img => img.includes(`image_${id}`));
        const storyContent = await fs.readFile(path.join(storiesDir, storyFile), 'utf-8');
        console.log(`Processing story ID ${id}: ${storyFile}, Image: ${imageFile || 'Not Found'}`);
        entries.push({
          id,
          story: storyContent,
          image: imageFile ? `/images/${imageFile}` : null // Adjust the path as needed
        });
      }
  
      // Sort entries by ID in descending order (latest first)
      entries.sort((a, b) => b.id - a.id);
  
      // Generate HTML
      let htmlContent = `
        <html>
          <head>
            <title>Past Stories and Images</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                color: #333;
                padding: 20px;
              }
              h1 {
                color: #444;
                text-align: center;
              }
              .entry {
                margin-bottom: 40px;
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .entry h2 {
                margin-top: 0;
              }
              .entry img {
                max-width: 100%;
                border-radius: 10px;
                box-shadow: 0px 5px 15px rgba(233, 30, 99, 0.3);
              }
            </style>
          </head>
          <body>
            <h1>Past Stories and Illustrations</h1>
      `;
  
      for (const entry of entries) {
        htmlContent += `
          <div class="entry">
            <h2>Story #${entry.id}</h2>
            <p>${entry.story}</p>
            ${entry.image ? `<img src="${entry.image}" alt="Illustration for story #${entry.id}">` : '<p><em>No image available</em></p>'}
          </div>
        `;
      }
  
      htmlContent += `
          </body>
        </html>
      `;
  
      res.send(htmlContent);
    } catch (error) {
      console.error("Error displaying past stories and images:", error);
      await logError(error);
      res.status(500).send("An error occurred while displaying past stories and images.");
    }
  });
  
  router.get('/compress/:number', async (req, res) => {
      const { number } = req.params;
    
       const imagesDir = path.join(__dirname, 'public', 'images');
      // const tmpDir = path.join(imagesDir, 'tmp');
      // const inputPath = path.join(imagesDir, `image_${number}.png`);
      // const outputPath = path.join(imagesDir, `image_${number}.png`);
  
   let num = parseInt(number, 10);
      if (isNaN(num) || num < 0) {
          return res.status(400).send('Invalid number parameter');
      }
  
      let results = [];
      for (let i = num; i >= 0; i--) {
          const inputPath = path.join(imagesDir, `image_${i}.png`);
          const outputPath = path.join(imagesDir, `image_${i}.jpg`); // Output as JPEG
  
          try {
              console.log('Processing image:', inputPath);
  
              // Check if the file exists
              await fs.access(inputPath);
  
              // Read the image
              const image = await Jimp.read(inputPath);
  
              // Resize the image to 512x512 pixels
              image.resize({ w: 512, h: 512 }).getBuffer('image/png', { quality: 80 });
  
              // Get the buffer as JPEG with quality 75%
              // const buffer = await image.getBufferAsync('image/jpeg', { quality: 75 });
  
              // Write the buffer to the output file
          await withTimeout(image.write(outputPath), 10000); // Updated write method
  
              console.log(`Compressed and saved: ${outputPath}`);
              results.push(`image_${i}.jpg compressed successfully`);
          } catch (error) {
              if (error.code === 'ENOENT') {
                  console.log(`Image not found: image_${i}.png, skipping...`);
                  continue; // Skip to the next image
              } else {
                  console.error(`Error processing image_${i}.png:`, error.message);
                  results.push(`Error processing image_${i}.png: ${error.message}`);
                  // Optionally, you can choose to continue or break the loop on other errors
                  continue; // Continue to the next image
              }
          }
      }
  
      res.send(results.join('\n'));
  });
  
  function withTimeout(promise, ms) {
      return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Operation timed out')), ms);
          promise
              .then((result) => {
                  clearTimeout(timeout);
                  resolve(result);
              })
              .catch((error) => {
                  clearTimeout(timeout);
                  reject(error);
              });
      });
  }


module.exports = router;
  