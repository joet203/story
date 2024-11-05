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

const elements = {
    promptText: document.getElementById('prompt-text'),
    optionsGroup: document.getElementById('options-group'),
    heroNameInput: document.getElementById('hero-name'),
    generateStoryButton: document.getElementById('generate-story-button'),
    startOverButton: document.getElementById('start-over-button'),
    loadingSpinner: document.getElementById('loading-spinner'),
    storyContainer: document.getElementById('story'),
    generateImageButton: document.getElementById('generate-image-button'),
    imageSpinner: document.getElementById('image-spinner'),
    illustrationContainer: document.getElementById('illustration'),
};

let selectedLook = null;

// Function to render options for the current step
function renderOptions(step) {
    const { category, prompt } = steps[step];
    elements.promptText.textContent = prompt;
    elements.optionsGroup.innerHTML = '';

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
            elements.optionsGroup.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            choices[category] = item.label;
            nextStep();
        });

        elements.optionsGroup.appendChild(option);
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
    elements.promptText.textContent = 'Choose Appearance:';
    elements.optionsGroup.style.display = 'none';

    const lookContainer = document.createElement('div');
    lookContainer.id = 'look-options';
    lookContainer.style.display = 'block';
    document.querySelector('.container').appendChild(lookContainer);

    // Function to create rows for each gender type
    function createLookRow(label, optionsArray) {
        const labelElement = document.createElement('p');
        labelElement.textContent = label;
        labelElement.style.fontWeight = 'bold';
        labelElement.style.marginTop = '1rem';
        lookContainer.appendChild(labelElement);

        const group = document.createElement('div');
        group.className = 'options-group';
        optionsArray.forEach(option => {
            const optionElement = document.createElement('span');
            optionElement.className = 'emoji-option';
            optionElement.textContent = option.emoji;
            optionElement.dataset.value = option.label;

            optionElement.addEventListener('click', () => {
                lookContainer.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
                optionElement.classList.add('selected');
                selectedLook = { gender: label, skinTone: option.label };
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
    elements.promptText.textContent = 'Enter Your Name:';
    elements.heroNameInput.style.display = 'block';
    elements.generateStoryButton.style.display = 'inline-block'; // Show Generate Story button only at Name step
    elements.startOverButton.style.display = 'inline-block';
}

// Generate Story button click event
elements.generateStoryButton.addEventListener('click', async () => {
    choices.name = elements.heroNameInput.value.trim() || 'Hero';
    choices.look = selectedLook || null;

    elements.loadingSpinner.style.display = 'block';
    elements.storyContainer.style.display = 'none';
    elements.illustrationContainer.style.display = 'none';

    // Hide name input and prompt while loading
    elements.promptText.style.display = 'none';
    elements.heroNameInput.style.display = 'none';

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
                gender: selectedLook?.gender, 
            })
        });

        elements.loadingSpinner.style.display = 'none';

        if (response.ok) {
            const data = await response.json();
            elements.storyContainer.textContent = data.story;
            elements.storyContainer.style.display = 'block';
            elements.generateImageButton.style.display = 'inline-block';
        } else {
            alert('Failed to generate story. Please try again.');
        }
    } catch {
        elements.loadingSpinner.style.display = 'none';
        alert('An error occurred. Please try again.');
    }
});

// Initialize the first step
renderOptions(currentStep);

// Start Over button resets the app
elements.startOverButton.addEventListener('click', () => {
    location.reload();
});

// Generate Image button click event
elements.generateImageButton.addEventListener('click', async () => {
    elements.imageSpinner.style.display = 'block';
    elements.illustrationContainer.style.display = 'none';

    try {
        const response = await fetch('/generate-illustration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                story: elements.storyContainer.textContent,
                gender: selectedLook?.gender,
                skinTone: selectedLook?.skinTone,
                color: choices.color,
                name: choices.name
            })
        });

        elements.imageSpinner.style.display = 'none';

        if (response.ok) {
            const data = await response.json();
            const img = document.createElement('img');
            img.src = data.imageUrl;
            img.alt = 'Generated Illustration';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0px 5px 15px rgba(90, 158, 216, 0.3)';
            elements.illustrationContainer.innerHTML = '';
            elements.illustrationContainer.appendChild(img);
            elements.illustrationContainer.style.display = 'block';
        } else {
            alert('Failed to generate illustration. Please try again.');
        }
    } catch {
        elements.imageSpinner.style.display = 'none';
        alert('An error occurred. Please try again.');
    }
});
