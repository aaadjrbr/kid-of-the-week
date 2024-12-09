import { displayDeckName, loadAndDisplayWords } from './app.js';

export function loadTextOptions() {
    const textList = document.getElementById('textList');
    textList.innerHTML = `
        <li data-text="./vocabulary/50-Most-Used-Nouns.js" data-display="50 Most Used Nouns (Substantivos)">50 Most Used Nouns (Substantivos)</li>
        <li data-text="./vocabulary/50-Most-Used-Adjectives.js" data-display="50 Most Used Adjectives (Adjetivos)">50 Most Used Adjectives (Adjetivos)</li>
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
