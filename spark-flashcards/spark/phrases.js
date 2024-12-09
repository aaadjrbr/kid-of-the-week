import { displayDeckName, loadAndDisplayWords } from './app.js';

export function loadTextOptions() {
    const textList = document.getElementById('textList');
    textList.innerHTML = `
        <li data-text="./phrases/Basic-Phrases.js" data-display="Basic Phrases">Basic Phrases</li>
        <li data-text="./phrases/Travel-Phrases.js" data-display="Must Know - Travel Phrases">Must Know - Travel Phrases</li>
    `;

    textList.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const selectedText = item.getAttribute('data-text');
            displayDeckName(selectedText);
            loadAndDisplayWords([selectedText]);
            document.getElementById('textModal').style.display = 'none';
        });
    });
}
