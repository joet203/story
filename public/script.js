import { options, lookOptions } from './options.js';

// Step definitions and initializations
const steps = [
    { category: 'color', prompt: 'Choose Your Favorite Color:' },
    { category: 'interest', prompt: 'Choose a Favorite Interest:' },
    { category: 'occupation', prompt: 'Choose an Occupation:' },
    { category: 'goal', prompt: 'Choose a Wellness Goal:' },
    { category: 'sidekick', prompt: 'Choose a Sidekick:' }
];

let currentStep = 0;
const choices = {};

// DOM elements
const promptText = document.getElementById('prompt-text');
const optionsGroup = document.getElementById('options-group');
const heroNameInput = document.getElementById('hero-name');
const generateStoryButton = document.getElementById('generate-story-button');
const startOverButton = document.getElementById('start-over-button');
const loadingSpinner = document.getElementById('loading-spinner');
const storyContainer = document.getElementById('story');
const generateImageButton = document.getElementById('generate-image-button');
const imageSpinner = document.getElementById('image-spinner');
const illustrationContainer = document.getElementById('illustration');

let selectedLook = null;

// Function to render options for the current step
function renderOptions(step) {
    const { category, prompt } = steps[step];
    promptText.textContent = prompt;
    optionsGroup.innerHTML = '';

    options[category].forEach(item => {
        const option = document.createElement('span');
        option.className = 'emoji-option';
        option.textContent = item.emoji;
        option.dataset.value = item.label;

        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = item.label;

        option.appendChild(optionText);
        option.addEventListener('click', () => {
            optionsGroup.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            choices[category] = item.label;
            nextStep();
        });

        optionsGroup.appendChild(option);
    });
}

// Function to move to the next step
function nextStep() {
    currentStep++;
    if (currentStep < steps.length) {
        renderOptions(currentStep);
    } else {
        renderLookOptions(); // Show Look options after the main categories
    }
}

// Render the Look options step
function renderLookOptions() {
    promptText.textContent = 'Choose Appearance:';
    optionsGroup.style.display = 'none';

    const lookContainer = document.createElement('div');
    lookContainer.id = 'look-options';
    lookContainer.style.display = 'block';
    document.querySelector('.container').appendChild(lookContainer);

    lookContainer.innerHTML = '';

    // Function to create rows for each gender type
    function createLookRow(label, options) {
        const labelElement = document.createElement('p');
        labelElement.textContent = label;
        labelElement.style.fontWeight = 'bold';
        labelElement.style.marginTop = '1rem';
        lookContainer.appendChild(labelElement);

        const group = document.createElement('div');
        group.className = 'options-group';
        options.forEach(option => {
            const optionElement = document.createElement('span');
            optionElement.className = 'emoji-option';
            optionElement.textContent = option.emoji;
            optionElement.dataset.value = `${label} ${option.label}`;

            optionElement.addEventListener('click', () => {
                lookContainer.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
                selectedLook = `${label} ${option.label}`;
                console.log(selectedLook);
                lookContainer.style.display = 'none';
                renderNameStep(); // Move to Name step after Look selection
            });

            group.appendChild(optionElement);
        });
        lookContainer.appendChild(group);
    }

    // Create rows for each gender type
    createLookRow('Male', lookOptions.male);
    createLookRow('Female', lookOptions.female);
    createLookRow('Neutral', lookOptions.neutral);
}

// Render the Name input step
function renderNameStep() {
    promptText.textContent = 'Enter Your Name:';
    heroNameInput.style.display = 'block';
    generateStoryButton.style.display = 'inline-block'; // Show Generate Story button only at Name step
    startOverButton.style.display = 'inline-block';
}

// Generate Story button click event
generateStoryButton.addEventListener('click', async () => {
    choices.name = heroNameInput.value || 'Joe';
    choices.look = selectedLook || null;

    loadingSpinner.style.display = 'block';
    storyContainer.style.display = 'none';
    illustrationContainer.style.display = 'none';

    // Hide name input and prompt while loading
    promptText.style.display = 'none';
    heroNameInput.style.display = 'none';

    try {
        const response = await fetch('/generate-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                color: choices.color,
                interest: choices.interest,
                dreamJob: choices.occupation,
                wellnessGoal: choices.goal,
                sidekick: choices.sidekick,
                name: choices.name,
                look: choices.look,
                gender: choices.look?.split(' ')[0], 
            })
        });

        loadingSpinner.style.display = 'none';

        if (response.ok) {
            const data = await response.json();
            storyContainer.textContent = data.story;
            storyContainer.style.display = 'block';
            generateImageButton.style.display = 'inline-block';
        } else {
            alert('Failed to generate story. Please try again.');
        }
    } catch {
        loadingSpinner.style.display = 'none';
        alert('An error occurred. Please try again.');
    }
});

// Initialize the first step
renderOptions(currentStep);

// Start Over button resets the app
startOverButton.addEventListener('click', () => {
    location.reload();
});

// Generate Image button click event
generateImageButton.addEventListener('click', async () => {
    imageSpinner.style.display = 'block';
    illustrationContainer.style.display = 'none';

    try {
        const response = await fetch('/generate-illustration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                story: storyContainer.textContent,
                gender: choices.look?.split(' ')[0],    // Extract gender (Male, Female, Neutral)
                skinTone: choices.look?.split(' ')[1],   // Extract skin tone (e.g., Light, Dark)
                color: choices.color   ,                  // Favorite color
                name: choices.name
            })
        });

        imageSpinner.style.display = 'none';

        if (response.ok) {
            const data = await response.json();
            const img = document.createElement('img');
            img.src = data.imageUrl;
            img.alt = 'Generated Illustration';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0px 5px 15px rgba(90, 158, 216, 0.3)';
            illustrationContainer.innerHTML = '';
            illustrationContainer.appendChild(img);
            illustrationContainer.style.display = 'block';
        } else {
            alert('Failed to generate illustration. Please try again.');
        }
    } catch {
        imageSpinner.style.display = 'none';
        alert('An error occurred. Please try again.');
    }
});
