import { displayDeckName, loadAndDisplayWords } from './app.js';

export function loadTextOptions() {
    const textList = document.getElementById('textList');
    textList.innerHTML = `
        <li data-text="./proficient/text1.js" data-display="An Proficient Story">An Proficient Story</li>
        <li data-text="./proficient/text2.js" data-display="Another Proficient Story">Another Proficient Story</li>
        <!-- Add more proficient texts here -->
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
