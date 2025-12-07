
// Helper to extract text safely
function getText(selector) {
    const el = document.querySelector(selector);
    return el ? el.innerText.trim() : '';
}

// Unit Inference Helper
const inferUnit = (pos) => {
    if (!pos) return 'Offense'; // Default fallback
    const p = pos.toUpperCase();

    const defense = ['DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'SAF', 'S', 'NT', 'DEFENSE'];
    const special = ['K', 'P', 'LS', 'SPECIAL TEAMS'];
    const offense = ['QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'T', 'OT', 'OG', 'OFFENSE'];

    if (defense.some(x => p === x || p.includes(' ' + x) || p.includes(x + ' '))) return 'Defense';
    if (special.some(x => p === x || p.includes(' ' + x) || p.includes(x + ' '))) return 'Special Teams';
    if (offense.some(x => p === x || p.includes(' ' + x) || p.includes(x + ' '))) return 'Offense';

    // Strict checks for Short codes to avoid partial matches in other words
    if (defense.includes(p)) return 'Defense';
    if (special.includes(p)) return 'Special Teams';

    return 'Offense';
};

// Improved Label Finder
const findByLabel = (labelText) => {
    // Look for element with exact text match of label
    // We restrict to specific tags to avoid matching giant containers
    const candidates = Array.from(document.querySelectorAll('dt, h6, h5, h4, span, div, strong, b, td, th'));

    const labelElem = candidates.find(el => {
        const text = el.innerText?.trim().toUpperCase();
        return text === labelText.toUpperCase() || text === labelText.toUpperCase() + ':';
    });

    if (labelElem) {
        // Case 1: Value is next sibling (e.g. <dt>Label</dt><dd>Value</dd>)
        if (labelElem.nextElementSibling && labelElem.nextElementSibling.innerText.trim()) {
            return labelElem.nextElementSibling.innerText.trim();
        }
        // Case 2: Value is child of next sibling
        if (labelElem.nextElementSibling && labelElem.nextElementSibling.firstElementChild) {
            return labelElem.nextElementSibling.firstElementChild.innerText.trim();
        }
        // Case 3: Value is in the parent text (e.g. <div>Label: Value</div>)
        if (labelElem.parentElement && labelElem.parentElement.innerText.includes(':')) {
            return labelElem.parentElement.innerText.split(':').pop().trim();
        }
        // Case 4: Vertical Stack (Table or Grid)
        // Look for the element at the same index in the next row or container
        if (labelElem.closest('tr')) {
            const thIndex = Array.from(labelElem.closest('tr').children).indexOf(labelElem);
            const table = labelElem.closest('table');
            const bodyRow = table.querySelector('tbody tr') || table.querySelectorAll('tr')[1];
            if (bodyRow && bodyRow.children[thIndex]) {
                return bodyRow.children[thIndex].innerText.trim();
            }
        }
    }
    return '';
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrapeBio") {

        // 1. Name and Number
        const h1 = document.querySelector('h1')?.innerText || document.title;
        const numberMatch = h1.match(/#(\d+)/);
        const number = numberMatch ? numberMatch[1] : '';
        const name = h1.replace(/#\d+/, '').trim();

        // 2. Image
        const allImages = Array.from(document.querySelectorAll('img'));
        let profileImg = allImages.find(img => img.src.includes('headshot') || (img.alt && img.alt.includes('headshot')));
        if (!profileImg) {
            profileImg = allImages.find(img => img.alt && img.alt.toUpperCase().includes(name.toUpperCase()));
        }
        if (!profileImg) {
            // Fallback: Largest image in top section
            profileImg = allImages.reduce((prev, current) => {
                const prevSize = (prev.width || 0) * (prev.height || 0);
                const currSize = (current.width || 0) * (current.height || 0);
                return (prevSize > currSize) ? prev : current;
            }, allImages[0]);
        }

        // 3. Bio Text (Cleaned)
        // We want to avoid Nav, Footer, and Cookies
        const badContainers = ['nav', 'header', 'footer', '.footer', '.menu', '.nav', '.cookie', '#onetrust-banner-sdk'];
        const candidates = Array.from(document.querySelectorAll('p, li, .bio-text, .content-text'));

        const bioParagraphs = candidates.filter(el => {
            // Must not be inside a bad container
            if (badContainers.some(sel => el.closest(sel))) return false;

            const text = el.innerText.trim();
            // Filter out short/irrelevant text
            if (text.length < 50) return false;
            if (text.includes('Copyright')) return false;
            if (text.includes('All Rights Reserved')) return false;
            if (text.includes('Privacy Policy')) return false;
            if (text.includes('Schedule')) return false; // "League Schedule" junk

            return true;
        }).map(el => el.innerText.trim());

        // Deduplicate and join
        const bioText = [...new Set(bioParagraphs)].join('\n\n');

        // 4. Fields
        let position = findByLabel('POSITION') || findByLabel('POS');
        // Fallback position finding: Look for exact position code in upper text
        if (!position) {
            const allText = document.body.innerText.slice(0, 2000).toUpperCase(); // First 2000 chars
            const knownPositions = ['QB', 'WR', 'TE', 'RB', 'OL', 'DL', 'LB', 'CB', 'SAF', 'K', 'P', 'LS'];
            const found = knownPositions.find(p => allText.includes(` ${p} `) || allText.includes(`\n${p}\n`) || allText.includes(` ${p}\n`));
            if (found) position = found;
        }

        const height = findByLabel('HEIGHT') || findByLabel('HT');
        const weight = findByLabel('WEIGHT') || findByLabel('WT');

        const rawData = {
            name: name,
            number: number,
            position: position,
            unit: inferUnit(position),
            height: height,
            weight: weight,
            college: findByLabel('COLLEGE'),
            hometown: findByLabel('HOMETOWN'),
            age_info: findByLabel('AGE'),
            image_url: profileImg ? profileImg.src : '',
            bio: bioText
        };

        console.log("Stallions Scraper BIO [Cleaned]:", rawData);
        sendResponse({ success: true, data: rawData });
    }
    else if (request.action === "scrapeStats") {
        // (Stats logic unchanged)
        const stats = {};
        const tables = document.querySelectorAll('table');

        tables.forEach((table, index) => {
            const title = table.previousElementSibling?.innerText || `Table ${index}`;
            const rows = Array.from(table.querySelectorAll('tr'));
            const headerRow = table.querySelector('thead tr') || rows[0];
            if (!headerRow) return;

            const headers = Array.from(headerRow.querySelectorAll('th, td')).map(th => th.innerText.trim());
            const dataRows = Array.from(table.querySelectorAll('tbody tr')).length > 0
                ? Array.from(table.querySelectorAll('tbody tr'))
                : rows.slice(1);

            const rowData = dataRows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const rowObj = {};
                cells.forEach((cell, i) => {
                    if (headers[i]) rowObj[headers[i]] = cell.innerText.trim();
                });
                return rowObj;
            });
            if (rowData.length > 0) stats[title] = rowData;
        });

        console.log("Stallions Scraper STATS:", stats);
        sendResponse({ success: true, data: stats });
    }
});
