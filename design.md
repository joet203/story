# **Story-AI Web App Design Document**

---

## **1\. Introduction**

### **Purpose**

This document outlines the design for a web application intended for use by wellness coaches working with middle school-aged students. The goal is to create a fun and engaging user experience that encourages kids to think and talk with counselors, fostering a positive vision of their wellness journey. The application allows students to input details about themselves to receive a custom story and image that reflect their interests and provide a positive message.

### **Scope**

This proof-of-concept focuses on developing a minimalist web application that:

* Is displayed in a browser on a laptop used by the teacher or counselor.  
* Provides an easy-to-use interface where children click images and text to make their inputs.  
* Utilizes a Node.js/Express backend server that integrates with OpenAI's APIs using their Node.js library.  
* Generates stories using GPT-4o and images using GPT-4o-mini and DALL·E 3\.  
* Saves stories and images to disk for simplicity, with the potential to integrate a database in the future.

### **Definitions**

* **Node.js**: JavaScript runtime built on Chrome's V8 engine  
* **Express**: Web application framework for Node.js  
* **GPT-4o**: OpenAI's GPT-4 optimized for story generation  
* **GPT-4o-mini**: A lighter version of GPT-4o for processing stories into image concepts  
* **DALL·E 3**: OpenAI's image generation model

---

## **2\. System Overview**

A simple web application that helps counselors engage middle school students through personalized stories and images:

* **Frontend**: Built with HTML, CSS, and JavaScript, providing an interactive UI where students select inputs via images and text.  
* **Backend**: A Node.js/Express server handling API requests, integrating with OpenAI's GPT-4o for story generation and DALL·E 3 for image generation.  
* **Workflow**:  
  1. User provides inputs through the UI.  
  2. Inputs are sent via AJAX to the backend server.  
  3. Backend generates a story using GPT-4o.  
  4. Story is displayed to the user.  
  5. If the user likes the story, they request an image. If not, they can generate a new story.  
  6. Backend processes the story with GPT-4o-mini to create an image concept.  
  7. DALL·E 3 generates an image based on the concept.  
  8. Story and image are saved to disk and displayed to the user.

---

## **3\. Requirements**

### **3.1 Functional Requirements**

* **User Interaction**: Allow users to input choices by clicking on emojis and text.  
* **Story Generation**: Generate a custom story based on user inputs using GPT-4o.  
* **Image Generation**: Upon request, generate an image that complements the story using GPT-4o-mini and DALL·E 3\.  
* **Data Saving**: Save the generated story and image to disk.  
* **Display Results**: Show the story and image to the user within the application.

### **3.2 Non-Functional Requirements**

* **Usability**: The UI should be intuitive and engaging for middle school students.  
* **Performance**: Responses from the backend should be prompt to maintain engagement.  
* **Scalability**: While starting as a proof-of-concept, the design should allow for future enhancements.  
* **Maintainability**: Code should be organized and documented for ease of updates.  
* **Security**: Minimal security concerns due to supervised usage and lack of sensitive data.

---

## **4\. System Architecture**

### **4.1 High-Level Architecture**

**![][image1]**

* **Client-Side**: Runs in the browser, handles user interactions, and displays content.  
* **Server-Side**: Node.js/Express server processes requests and integrates with OpenAI APIs.  
* **OpenAI Services**: GPT-4o, GPT-4o-mini, and DALL·E 3 APIs for content generation.  
* **Storage**: Stories and images are saved to the server's file system.

### **4.2 Components Description**

* **Frontend (Client-Side)**:  
  * **HTML/CSS/JavaScript**: Builds the UI for user interaction.  
  * **AJAX Requests**: Communicates with the backend server without page reloads.  
* **Backend (Server-Side)**:  
  * **Express Server**: Handles routing and middleware.  
  * **OpenAI Integration**: Uses OpenAI Node.js library for API calls.  
  * **Endpoints**:  
    * `POST /generate-story`  
    * `POST /generate-image`  
  * **File System Operations**: Saves and retrieves stories and images.  
* **OpenAI APIs**:  
  * **GPT-4o**: Generates personalized stories.  
  * **GPT-4o-mini**: Converts stories into image concepts.  
  * **DALL·E 3**: Generates images from text concepts.

---

## **5\. Detailed Design**

### **5.1 Frontend Modules**

* **Input Module**:  
  * Presents clickable images and text options for user inputs.  
  * Validates and packages inputs for the backend.  
* **Story Display Module**:  
  * Displays the generated story.  
  * Includes a button to generate an image.  
* **Image Display Module**:  
  * Shows the generated image below the story.

### **5.2 Backend Modules**

* **API Endpoints**:  
  * **`POST /generate-story`**:  
    * Receives user inputs.  
    * Calls GPT-4o to generate a story.  
    * Saves the story to disk.  
    * Sends the story back to the frontend.  
  * **`POST /generate-image`**:  
    * Receives request to generate an image.  
    * Processes the story with GPT-4o-mini to create an image concept.  
    * Calls DALL·E 3 to generate the image.  
    * Saves the image to disk.  
    * Sends the image back to the frontend.  
* **OpenAI Integration Module**:  
  * Handles authentication and API calls to OpenAI services.  
  * Manages rate limiting and error handling.

### **5.3 Data Models**

* **User Input Model**:  
  * Attributes: `preferences`, `selectedImages`, `selectedTextOptions`  
* **Story Model**:  
  * Attributes: `storyText`, `timestamp`, `userId`  
* **Image Model**:  
  * Attributes: `imagePath`, `associatedStoryId`, `timestamp`

---

## **6\. User Interface Design**

* **Layout**:  
  * **Header**: Application title and brief instructions.  
  * **Input Section**:  
    * Grid of images and text options for user selection.  
    * Submit button to generate the story.  
  * **Output Section**:  
    * Displays the generated story.  
    * Button to generate an image if the story is liked.  
    * Displays the generated image below the story.  
* **Design Principles**:  
  * **Simplicity**: Minimalist design to avoid overwhelming users.  
  * **Engagement**: Use of vibrant colors and interactive elements.  
  * **Accessibility**: Fonts and colors chosen for readability.

---

## **7\. Database Design**

### **Current Implementation**

* **File System Storage**:  
  * Stories saved as `.txt` or `.json` files.  
  * Images saved in a designated directory with reference filenames.

### **Future Considerations**

* **Database Integration**:  
  * Options: SQLite, PostgreSQL, CosmosDB.  
  * Benefits: Enhanced data management, querying capabilities, scalability.  
  * Image Storage: Compress and store images efficiently.

---

## **8\. Security Considerations**

* **Data Privacy**:  
  * No personal identifiable information (PII) is collected.  
  * User inputs are generic preferences.  
* **Application Security**:  
  * Input validation to prevent injection attacks.  
    * Add allow-list on server-side to validate inputs  
  * Error handling to prevent exposure of system details.

---

## **9\. Testing Plan**

### **Unit Testing**

* **Frontend Tests**:  
  * Validate UI elements render correctly.  
  * Ensure input selections are captured accurately.  
* **Backend Tests**:  
  * Test API endpoints with mock data.  
  * Verify OpenAI API integration works as expected.

### **Integration Testing**

* **End-to-End Scenarios**:  
  * Simulate user interactions from input to story and image generation.  
  * Check data flow between frontend and backend.

### **Performance Testing**

* **Response Times**:  
  * Measure time taken for story and image generation.  
  * Optimize code to reduce latency.

### **User Acceptance Testing**

* **Feedback Sessions**:  
  * Conduct testing sessions with counselors and a small group of students.  
  * Collect feedback on usability and engagement.

---

## **10\. Deployment Plan**

### **Deployment Environment**

* **Glitch.com**  
  * Free managed hosting environment sufficient for demo and user testing  
  * Clone from Git URL  
  * Set API key for OpenAI in .env file

* **Local Deployment**:  
  * For development.  
  * Requires Node.js and npm installed.

### **Local Installation Instructions**

1. **Clone Repository**:  
   * `git clone [repository_url]`  
2. **Install Dependencies**:  
   * Navigate to the project directory.  
   * Run `npm install`.  
3. **Configure OpenAI API Key**:  
   * Obtain API key from OpenAI.  
   * Store the key in `.env` file.  
4. **Start Server**:  
   * Run `node server.js` or `npm start`.  
5. **Access Application**:  
   * Open a web browser and navigate to `http://localhost:3000`.

### **Maintenance and Support**

* **Updates**:  
  * Periodically update dependencies to the latest versions.  
  * Monitor OpenAI API changes.  
* **Support**:  
  * Documented code for ease of handover.  
  * Contact information for developer assistance.

---

## **11\. Appendices**

### **A. Glossary**

* **AJAX**: Technique for asynchronous web requests.  
* **API**: Interface for interacting with software components.  
* **Express**: Web framework for building Node.js applications.  
* **Node.js**: Server-side JavaScript runtime.

### **B. Diagrams**

* **System Architecture Diagram**: 

![image](https://github.com/user-attachments/assets/6539343f-feca-4981-a2ac-c2893fb8892f)


* **UI Wireframes**: \[ to be created\]

### **C. Revision History**

* **Version 1.0**:  
  * Initial draft completed on 11/4/2024.

