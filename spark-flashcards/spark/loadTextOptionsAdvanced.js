export function loadTextOptions() {
    const textList = document.getElementById('textList');
    textList.innerHTML = `
        <li data-text="./advanced/text1.js" data-display="An Advanced Story">An Advanced Story</li>
        <li data-text="./advanced/text2.js" data-display="Another Advanced Story">Another Advanced Story</li>
        <!-- Add more advanced texts here -->
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
