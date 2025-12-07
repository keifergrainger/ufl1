
document.addEventListener('DOMContentLoaded', () => {
    const bioBtn = document.getElementById('scrapeBio');
    const statsBtn = document.getElementById('scrapeStats');
    const uploadBtn = document.getElementById('upload');
    const statusDiv = document.getElementById('status');
    const previewDiv = document.getElementById('preview');

    // Load state
    chrome.storage.local.get(['playerBio', 'playerStats'], (result) => {
        if (result.playerBio) {
            statusDiv.innerText = `Bio for ${result.playerBio.name} saved.`;
            bioBtn.style.background = '#0a0'; // Green to indicate done
        }
        if (result.playerStats) {
            statusDiv.innerText += ` Stats saved. Ready to upload.`;
            statsBtn.style.background = '#0a0';
        }
        updateUploadButton(result);
    });

    bioBtn.addEventListener('click', () => {
        sendMessage('scrapeBio', (response) => {
            if (response && response.success) {
                chrome.storage.local.set({ playerBio: response.data }, () => {
                    statusDiv.innerText = 'Bio saved!';
                    bioBtn.style.background = '#0a0';
                    checkReady();
                });
            } else {
                statusDiv.innerText = 'Failed to scrape Bio.';
            }
        });
    });

    statsBtn.addEventListener('click', () => {
        sendMessage('scrapeStats', (response) => {
            if (response && response.success) {
                chrome.storage.local.set({ playerStats: response.data }, () => {
                    statusDiv.innerText = 'Stats saved!';
                    statsBtn.style.background = '#0a0';
                    checkReady();
                });
            } else {
                statusDiv.innerText = 'Failed to scrape Stats.';
            }
        });
    });

    uploadBtn.addEventListener('click', () => {
        chrome.storage.local.get(['playerBio', 'playerStats'], async (result) => {
            if (!result.playerBio) return;

            const payload = {
                ...result.playerBio,
                stats: result.playerStats || {}
            };

            statusDiv.innerText = 'Uploading...';

            try {
                const res = await fetch('http://localhost:3000/api/import-player', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    statusDiv.innerText = 'Success! Player sent to Admin.';
                    // Clear storage
                    chrome.storage.local.clear();
                    bioBtn.style.background = '#c00';
                    statsBtn.style.background = '#c00';
                    uploadBtn.disabled = true;
                } else {
                    statusDiv.innerText = 'Error: ' + data.error;
                }
            } catch (e) {
                statusDiv.innerText = 'Network Error. Is localhost:3000 running?';
            }
        });
    });

    function sendMessage(action, callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: action }, callback);
        });
    }

    function checkReady() {
        chrome.storage.local.get(['playerBio'], (result) => {
            updateUploadButton(result);
        });
    }

    function updateUploadButton(result) {
        if (result.playerBio) {
            uploadBtn.disabled = false;
            uploadBtn.style.background = '#0070f3'; // Blue for ready
        }
    }
});
