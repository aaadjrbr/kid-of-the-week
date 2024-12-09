import { loadTextData } from '../script.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, increment, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { openDB } from 'https://unpkg.com/idb?module';

const firebaseConfig = {
    apiKey: "AIzaSyD9myB6phhwC9DzTnfok2tjKxc4aPvDVXY",
    authDomain: "son-of-the-week.firebaseapp.com",
    projectId: "son-of-the-week",
    storageBucket: "son-of-the-week.firebasestorage.app",
    messagingSenderId: "632406897939",
    appId: "1:632406897939:web:62d36dda966dcd565416e6",
    measurementId: "G-48RYQSMEFK"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initDB = async () => {
    return openDB('flashcardsDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('buriedCards')) {
                db.createObjectStore('buriedCards', { keyPath: 'word' });
            }
        },
    });
};

const dbPromise = initDB();

const cacheBuriedCard = async (wordObj) => {
    const db = await dbPromise;
    await db.put('buriedCards', wordObj);
};

const uncacheBuriedCard = async (word) => {
    const db = await dbPromise;
    await db.delete('buriedCards', word);
};

const getCachedBuriedCards = async () => {
    const db = await dbPromise;
    return await db.getAll('buriedCards');
};

const updateLocalStorageWithTimestamp = (userId, count) => {
    const timestamp = new Date().getTime();
    localStorage.setItem(`wordCount-${userId}`, count);
    localStorage.setItem(`wordCountTimestamp-${userId}`, timestamp);
};

const isLocalStorageExpired = (userId) => {
    const timestamp = localStorage.getItem(`wordCountTimestamp-${userId}`);
    if (!timestamp) return true;

    const currentTime = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return (currentTime - timestamp) > twentyFourHours;
};

const clearLocalStorageIfExpired = (userId) => {
    if (isLocalStorageExpired(userId)) {
        localStorage.removeItem(`wordCount-${userId}`);
        localStorage.removeItem(`wordCountTimestamp-${userId}`);
    }
};

const updateSavedWordCount = (userId) => {
    const docRef = doc(db, `spark-wordCounter/${userId}`);

    onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const count = doc.data().count;
            updateLocalStorageWithTimestamp(userId, count);
            document.getElementById('savedWordsCount').textContent = `${count}/50 saved phrases 💾`;
        } else {
            setDoc(docRef, { count: 0 });
            updateLocalStorageWithTimestamp(userId, 0);
            document.getElementById('savedWordsCount').textContent = `0/50 saved phrases 💾`;
        }
    });
};

const getSavedWordCountFromLocalStorage = (userId) => {
    return localStorage.getItem(`wordCount-${userId}`) || 0;
};

const incrementWordCount = async (userId) => {
    const docRef = doc(db, `spark-wordCounter/${userId}`);
    await updateDoc(docRef, {
        count: increment(1)
    });
};

const decrementWordCount = async (userId) => {
    const docRef = doc(db, `spark-wordCounter/${userId}`);
    await updateDoc(docRef, {
        count: increment(-1)
    });
};

export const displayDeckName = (selectedText) => {
    const deckNameElement = document.getElementById('deckName');
    if (selectedText === "buriedCards") {
        deckNameElement.textContent = "You are studying: My Saved Phrases 💾";
    } else {
        const selectedOption = document.querySelector(`#textList li[data-text="${selectedText}"]`);
        const deckName = selectedOption ? selectedOption.getAttribute('data-display') : 'All Texts';
        deckNameElement.textContent = `You are studying: ${deckName}`;
    }
};

export const loadAndDisplayWords = async (selectedPaths) => {
    const filterWords = ['']; // Adjust as needed
    try {
        const filteredWords = await loadTextData(selectedPaths, filterWords);
        displayWordCount(filteredWords.length);
        displayFlashcards(filteredWords, false);
    } catch (error) {
        console.error("Error loading text data:", error);
    }
};

const displayWordCount = (count) => {
    const wordCountElement = document.getElementById('wordCount');
    wordCountElement.textContent = `${count} phrases available to study`;
};

// Function to get and populate available voices
const populateVoiceList = () => {
    const synth = window.speechSynthesis;
    let voices = synth.getVoices().filter(voice => voice.lang.includes('pt-BR'));

    if (!voices.length) {
        synth.onvoiceschanged = () => {
            voices = synth.getVoices().filter(voice => voice.lang.includes('pt-BR'));
            populateVoiceList(); // Repopulate voices when they become available
        };
        return;
    }

    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = ''; // Clear existing options

    const defaultVoiceNames = ['Google português do Brasil', 'Luciana'];
    let defaultVoice;

    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        defaultVoice = voices.find(voice => voice.name === 'Luciana');
    } else if (/Android/.test(navigator.userAgent)) {
        defaultVoice = voices.find(voice => voice.name === 'Google português do Brasil') || voices[0];
    } else {
        defaultVoice = voices.find(voice => voice.name === 'Google português do Brasil') || voices[0];
    }

    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = voice.name;
        option.value = voice.name;
        if (voice === defaultVoice) {
            option.selected = true; // Set the default selected voice
        }
        voiceSelect.appendChild(option);
    });
};

// Call populateVoiceList when the page loads
window.onload = populateVoiceList;

// Function to speak a given text
const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = document.getElementById('voiceSelect').value;
    const voice = synth.getVoices().find(voice => voice.name === selectedVoice);
    if (voice) {
        utterance.voice = voice;
    }
    utterance.lang = 'en-US';
    synth.speak(utterance);
};

const displayFlashcards = (words, isBuried) => {
    const container = document.getElementById('flashcards-container');
    container.innerHTML = '';
    if (words.length === 0) {
        container.innerHTML = '<p class="saved-deck-message">No phrases saved 🥺</p>';
        document.getElementById('wordCount').textContent = '';
        document.getElementById('loadingBar').style.width = '0%';
        return;
    }

    words.forEach((wordObj, index) => {
        const flashcard = document.createElement('div');
        flashcard.className = 'flashcard';
        if (isBuried) {
            flashcard.classList.add('buried');
        }

        // Construct the flashcard HTML
        flashcard.innerHTML = `
            <button class="buryButton">${isBuried ? 'Remove Phrase 🗑️' : 'Save Phrase 💾'}</button>
            <div class="flashcard-inner">
            <div class="spacer"></div>
                <div class="flashcard-front" title="Click to see the translation">
                    <p>${wordObj.word}</p>
                    ${wordObj.note ? `<p class="note"><em>Note: ${wordObj.note}</em></p>` : ''}
                    <br/><br/>
                    <button class="speakButton" title="Listen to the phrase">🔊</button>
                </div>
                <div class="flashcard-back">
                    <p>${wordObj.translation}</p>
                </div>
            </div>
        `;

        if (index === 0) {
            flashcard.style.display = 'block'; // Show the first card initially
        }

        // Add event listeners for buttons
        flashcard.querySelector('.buryButton').addEventListener('click', async (event) => {
            event.stopPropagation(); // Prevent card flip
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                const userId = user.uid;
                if (isBuried) {
                    await unburyCard(wordObj, userId);
                    flashcard.remove();
                    if (container.children.length === 0) {
                        container.innerHTML = '<p class="saved-deck-message">No phrases saved 🥺</p>';
                        document.getElementById('wordCount').textContent = '';
                        document.getElementById('loadingBar').style.width = '0%';
                    }
                    decrementWordCount(userId);
                } else {
                    checkBuryLimit(userId).then((canBury) => {
                        if (canBury) {
                            buryCard(wordObj, userId);
                            flashcard.classList.add('buried');
                            incrementWordCount(userId);
                        } else {
                            document.getElementById('limitMessage').style.display = 'block';
                        }
                    });
                }
            } else {
                console.error('No authenticated user found.');
            }
        });

        flashcard.querySelector('.speakButton').addEventListener('click', (event) => {
            event.stopPropagation();
            speakText(wordObj.word);
        });

        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('flipped');
        });

        container.appendChild(flashcard);
    });

    let currentIndex = 0;
    const flashcards = document.querySelectorAll('.flashcard');
    document.getElementById('prevButton').addEventListener('click', () => {
        if (flashcards.length > 0) {
            flashcards[currentIndex].style.display = 'none';
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : flashcards.length - 1;
            flashcards[currentIndex].style.display = 'block';
            updateWordProgress(currentIndex, flashcards.length);
        }
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        if (flashcards.length > 0) {
            flashcards[currentIndex].style.display = 'none';
            currentIndex = (currentIndex < flashcards.length - 1) ? currentIndex + 1 : 0;
            flashcards[currentIndex].style.display = 'block';
            updateWordProgress(currentIndex, flashcards.length);
        }
    });

    updateWordProgress(currentIndex, flashcards.length);
};

const updateWordProgress = (currentIndex, totalWords) => {
    const wordCountElement = document.getElementById('wordCount');
    wordCountElement.textContent = `${currentIndex + 1} of ${totalWords} phrases available to study`;
    updateLoadingBar(((currentIndex + 1) / totalWords) * 100);
};

const updateLoadingBar = (progress) => {
    const loadingBar = document.getElementById('loadingBar');
    loadingBar.style.width = progress + '%';
};

const checkBuryLimit = async (userId) => {
    const buriedCardsSnapshot = await getDocs(collection(db, `spark/${userId}/buriedCards`));
    return buriedCardsSnapshot.size < 50;
};

const buryCard = async (wordObj, userId) => {
    try {
        const cardRef = doc(collection(db, `spark/${userId}/cards`), wordObj.word);
        const buriedCardRef = doc(collection(db, `spark/${userId}/buriedCards`), wordObj.word);

        // Add to buriedCards
        await setDoc(buriedCardRef, wordObj);
        await cacheBuriedCard(wordObj);

        // Remove from cards
        await deleteDoc(cardRef);
    } catch (error) {
        console.error("Error burying card:", error);
    }
};

const unburyCard = async (wordObj, userId) => {
    try {
        const buriedCardRef = doc(collection(db, `spark/${userId}/buriedCards`), wordObj.word);
        const cardRef = doc(collection(db, `spark/${userId}/cards`), wordObj.word);

        // Add back to cards
        await setDoc(cardRef, wordObj);
        await uncacheBuriedCard(wordObj.word);

        // Remove from buriedCards
        await deleteDoc(buriedCardRef);
    } catch (error) {
        console.error("Error unburying card:", error);
    }
};

const loadBuriedCards = async (userId) => {
    try {
        const buriedCardsSnapshot = await getDocs(collection(db, `spark/${userId}/buriedCards`));
        const buriedWords = buriedCardsSnapshot.docs.map(doc => doc.data());
        const cachedBuriedCards = await getCachedBuriedCards();

        if (buriedWords.length !== cachedBuriedCards.length) {
            console.log("Updating cache with latest buried cards from Firestore.");
            const db = await dbPromise;
            const tx = db.transaction('buriedCards', 'readwrite');
            const store = tx.objectStore('buriedCards');

            // Clear existing cache and update with new data
            await store.clear();
            for (const word of buriedWords) {
                await store.put(word);
            }
        }

        displayDeckName("buriedCards");
        displayWordCount(buriedWords.length);
        displayFlashcards(buriedWords, true);
    } catch (error) {
        console.error("Error loading buried cards:", error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('Authenticated User ID:', user.uid);
            const userId = user.uid;

            // Check and clear local storage if expired
            clearLocalStorageIfExpired(userId);

            // Populate voices when the page loads
            populateVoiceList();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = populateVoiceList;
            }

            // Update saved word count initially
            const initialCount = getSavedWordCountFromLocalStorage(userId);
            document.getElementById('savedWordsCount').textContent = `${initialCount}/50 saved phrases 💾`;

            // Set up real-time listener for word count
            updateSavedWordCount(userId);

            document.getElementById('modalButton').addEventListener('click', async () => {
                const levelSelector = document.getElementById('levelSelector');
                const selectedLevel = levelSelector.value;
                let scriptPath;
                if (selectedLevel === 'phrases') {
                    scriptPath = './phrases.js';
                } else if (selectedLevel === 'vocabulary') {
                    scriptPath = './vocabulary.js';
                //} else if (selectedLevel === 'advanced') {
                    //scriptPath = './loadTextOptionsAdvanced.js';
                //} else if (selectedLevel === 'proficient') {
                    //scriptPath = './loadTextOptionsProficient.js';
                }
            
                if (scriptPath) {
                    const { loadTextOptions } = await import(scriptPath);
                    loadTextOptions();
                }
            
                const modal = document.getElementById('textModal');
                modal.style.display = 'block';
                document.body.classList.add('modal-open'); // Add this line
            });
            
            document.getElementsByClassName('close')[0].addEventListener('click', () => {
                const modal = document.getElementById('textModal');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open'); // Add this line
            });
            
            window.addEventListener('click', (event) => {
                const modal = document.getElementById('textModal');
                if (event.target == modal) {
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open'); // Add this line
                }
            });
            
            document.querySelectorAll('#textList').forEach(button => {
                button.addEventListener('click', () => {
                    const modal = document.getElementById('textModal');
                    modal.style.display = 'none';
                    document.body.classList.remove('modal-open'); // Add this line
                });
            });

            document.getElementById('viewBuriedButton').addEventListener('click', () => {
                loadBuriedCards(userId);
            });

            // Show the site content after everything is loaded
            document.querySelector('.loader-container').style.display = 'none';
            document.querySelector('#site-content').style.display = 'block';
        } else {
            console.log('No user is signed in.');
        }
    });
});
