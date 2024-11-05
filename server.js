require('dotenv').config();
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const { Configuration, OpenAIApi } = require("openai");
const fetch = require("node-fetch");
const extraRoutes = require('./debug/extraRoutes'); 
const helpers = require('./helpers');

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', extraRoutes);

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

helpers.ensureDirectoriesExist();

// Endpoint to generate a story
// TODO: validate inputs against allow-list
app.post("/generate-story", async (req, res) => {
  const { color, interest, dreamJob, wellnessGoal, sidekick, name, gender } = req.body;

  // Check for required fields
  if (!color || !interest || !dreamJob || !wellnessGoal || !sidekick || !name) {
    return res.status(400).json({
      error: 'Please provide all required elements: color, interest, dreamJob, wellnessGoal, sidekick, and name.'
    });
  }

  try {
    const prompt = createPrompt({
      color,
      interest,
      dreamJob,
      wellnessGoal,
      sidekick,
      name,
      gender
    });

    const msgs = [{ role: "system", content: prompt }];

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: msgs,
      max_tokens: 215,
      temperature: 0.4,
    });

    const story = completion.data.choices[0].message.content.trim();
    await helpers.logRequest(story); // Log the generated story
    res.json({ story: story });
  } catch (error) {
    console.error('Error generating story:', error);
    await helpers.logError(error);
    res.status(500).json({ error: 'An error occurred while generating the story.' });
  }
});

// Endpoint to generate an illustration for the story
// TODO: validate inputs against allow-list
app.post("/generate-illustration", async (req, res) => {
  const { story, gender, skinTone, color, name } = req.body;

  if (!story) {
    return res.status(400).json({ error: 'Please provide the story to illustrate.' });
  }

  try {
    const id = await helpers.getNextID();

    // Log the story to a text file in the 'stories' directory
    const storyFile = path.join(__dirname, 'stories', `story_${id}.txt`);
    await fs.writeFile(storyFile, story);
    console.log(`Story saved successfully: ${storyFile}`);

    // Distill the story into a scene description
    const sceneDescription = await distillStoryToScene(story, gender, skinTone, color);
    console.log(`Scene description: ${sceneDescription}`);

    let prompt = "";

    // Add optional attributes if they are present
    if (gender) prompt += `${name} is gender ${gender}. `;
    if (skinTone) prompt += `${name} has ${skinTone} skin. `;
    if (color) prompt += `Use a ${color} color theme. `;

    // Use the scene description to generate the image
    prompt += `A fun, colorful illustration depicting the following scene: ${sceneDescription}. The style should be cartoonish and show the character in a positive light. Images only. Digital art.`;
    console.log(skinTone);

    const response = await openai.createImage({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (response.status !== 200) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const imageUrl = response.data.data[0].url;

    // Download and save the image to disk. TODO: compress the image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.buffer();
    const imageFile = path.join(__dirname, 'public', 'images', `image_${id}.png`);
    const dir = path.dirname(imageFile);
    try {
      // Create the directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(imageFile, buffer);
      console.log(`Image saved successfully: ${imageFile}`);
    } catch (error) {
      console.error("Error saving image:", error);
      await helpers.logError(error);
    }

    const imagePath = `/images/image_${id}.png`; // Return the local image path

    res.json({ imagePath });
  } catch (error) {
    console.error("Error generating illustration:", error);
    await helpers.logError(error);
    res.status(500).json({ error: "Failed to generate illustration" });
  }
});

// Function to create the prompt for the story
function createPrompt(elements = {}) {
  const {
    color = '',
    interest = '',
    dreamJob = '',
    wellnessGoal = '',
    sidekick = '',
    name = '',
    gender = ''
  } = elements;

  return `
Create an inspiring micro-story (maximum 5-6 sentences) for a middle school student about personal growth in which they star as the hero. Incorporate these elements naturally:

WELLNESS GOAL: ${wellnessGoal || 'being more active'} (current challenge)
INTEREST: ${interest || 'science'} (their passion)
DREAM JOB: ${dreamJob || 'scientist'} (future goal)
SIDEKICK: ${sidekick || 'a loyal pet dog'} (their helper)
NAME: ${name}
GENDER: ${gender}
COLOR: ${color || 'blue'} (as a meaningful detail)

Story Requirements:
- Keep it extremely brief but impactful (5-6 sentences maximum)
- Start with the wellness challenge
- Include their interest and future dream as part of the solution
- Show how their sidekick helps
- End with a clear win or positive realization
- Keep language simple and upbeat

The story should feel like a quick burst of inspiration that shows how small positive changes lead to bigger dreams.
`;
}

// Function to distill the story into a scene description
async function distillStoryToScene(story, gender, skinTone, color) {
  let prompt = `Please read the following story and distill it into a single, detailed visual scene description suitable for illustration:

"${story}"

Provide a concise scene description focusing on the main character achieving their dream and becoming their best self.`;

  // Add optional attributes if they are present
  if (gender) prompt += ` The young hero is ${gender}.`;
  if (skinTone) prompt += ` The hero has ${skinTone} skin tone.`;
  if (color) prompt += ` Use a ${color} color theme.`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4o-mini', 
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
    temperature: 0.7,
  });

  const sceneDescription = completion.data.choices[0].message.content.trim();
  return sceneDescription;
}

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running  . ");
});
