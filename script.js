// script.js
// Handles interactions with the backend API for uploading documents and asking questions.
const BACKEND_URL = 'https://my-rag-api.onrender.com';
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadStatus = document.getElementById('upload-status');
    const askButton = document.getElementById('ask-button');
    const queryInput = document.getElementById('query-input');
    const answerArea = document.getElementById('answer-area');

    // Maintain a simple conversation log on the client side
    const conversation = [];

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadStatus.textContent = '';
        if (!fileInput.files.length) {
            uploadStatus.textContent = 'Please select one or more files to upload.';
            uploadStatus.style.color = 'red';
            return;
        }
        const formData = new FormData();
        for (const file of fileInput.files) {
            formData.append('files', file);
        }
        try {
            const response = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Upload failed');
            }
            const data = await response.json();
            uploadStatus.textContent = `Successfully ingested ${data.ingested_chunks} chunks.`;
            uploadStatus.style.color = 'green';
            // Clear file input
            fileInput.value = '';
        } catch (err) {
            uploadStatus.textContent = `Error: ${err.message}`;
            uploadStatus.style.color = 'red';
        }
    });

    askButton.addEventListener('click', async () => {
        const query = queryInput.value.trim();
        if (!query) {
            alert('Please enter a question.');
            return;
        }
        // Add user message to conversation log and display
        conversation.push({ role: 'user', content: query });
        renderConversation(answerArea, conversation);
        queryInput.value = '';
        try {

            
            const response = await fetch(`${BACKEND_URL}/query`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Query failed');
            }
            const data = await response.json();
            // Add assistant message to conversation log and render
            conversation.push({ role: 'assistant', content: data.answer });
            renderConversation(answerArea, conversation);
        } catch (err) {
            conversation.push({ role: 'assistant', content: `Error: ${err.message}` });
            renderConversation(answerArea, conversation);
        }
    });
});

/**
 * Render the entire conversation into the answer area.
 * @param {HTMLElement} area - The DOM element to render into.
 * @param {Array} convo - Array of message objects with `role` and `content`.
 */
function renderConversation(area, convo) {
    area.innerHTML = '';
    convo.forEach(({ role, content }) => {
        const message = document.createElement('div');
        message.className = `message ${role}`;
        message.textContent = (role === 'user' ? 'User: ' : 'Assistant: ') + content;
        area.appendChild(message);
    });
}