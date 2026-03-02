// ===== STORAGE MANAGEMENT SYSTEM =====
const STORAGE_CONFIG = {
    MAX_SIZE: 500 * 1024 * 1024, // 500MB max (half a gigabyte)
    PLAYLIST_KEY: 'playlist',
    PREFIX: 'song_'
};

// Get storage info
function getStorageInfo() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        return {
            used: totalSize,
            max: STORAGE_CONFIG.MAX_SIZE,
            percentage: (totalSize / STORAGE_CONFIG.MAX_SIZE) * 100,
            available: STORAGE_CONFIG.MAX_SIZE - totalSize
        };
    } catch (e) {
        return { used: 0, max: STORAGE_CONFIG.MAX_SIZE, percentage: 0, available: STORAGE_CONFIG.MAX_SIZE };
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function updateStorageDisplay() {
    const info = getStorageInfo();
    const usedMB = (info.used / (1024 * 1024)).toFixed(2);
    const maxMB = (info.max / (1024 * 1024)).toFixed(2);
    const usedElement = document.getElementById('storageUsed');
    const maxElement = document.getElementById('storageMax');
    if (usedElement) usedElement.textContent = usedMB + ' MB';
    if (maxElement) maxElement.textContent = maxMB + ' MB';
}

// Restore background from localStorage on page load
(function() {
    const bgImg = localStorage.getItem('customBgImg');
    if(bgImg) {
        document.body.style.backgroundImage = `url('${bgImg}')`;
    }
})();

// --- HOLIDAYS HELPERS ---
function nthWeekdayOfMonth(year, month, weekday, n) {
    let date = new Date(year, month, 1);
    let count = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === weekday) {
            count++;
            if (count === n) return new Date(date);
        }
        date.setDate(date.getDate() + 1);
    }
    return null;
}

function lastWeekdayOfMonth(year, month, weekday) {
    let date = new Date(year, month + 1, 0);
    while (date.getDay() !== weekday) {
        date.setDate(date.getDate() - 1);
    }
    return new Date(date);
}

function easter(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

function mlkDay(year) { return nthWeekdayOfMonth(year, 0, 1, 3); }
function presidentsDay(year) { return nthWeekdayOfMonth(year, 1, 1, 3); }
function memorialDay(year) { return lastWeekdayOfMonth(year, 4, 1); }
function laborDay(year) { return nthWeekdayOfMonth(year, 8, 1, 1); }
function thanksgiving(year) { return nthWeekdayOfMonth(year, 10, 4, 4); }

function getUSHolidays(year) {
    return [
        { name: "🎉 New Year's Day", date: new Date(year, 0, 1) },
        { name: "🛑 Martin Luther King Jr Day", date: mlkDay(year) },
        { name: "🇺🇸 Presidents Day", date: presidentsDay(year) },
        { name: "🐰 Easter", date: easter(year) },
        { name: "🌷 Memorial Day", date: memorialDay(year) },
        { name: "🎆 Independence Day", date: new Date(year, 6, 4) },
        { name: "🍁 Labor Day", date: laborDay(year) },
        { name: "🦃 Thanksgiving", date: thanksgiving(year) },
        { name: "🎄 Christmas Day", date: new Date(year, 11, 25) }
    ].filter(h => h.date instanceof Date && !isNaN(h.date.getTime()));
}

function findNextHoliday(now) {
    const thisYear = now.getFullYear();
    let holidays = getUSHolidays(thisYear).concat(getUSHolidays(thisYear + 1));
    holidays.sort((a, b) => a.date - b.date);
    for (let i = 0; i < holidays.length; i++) {
        if (holidays[i].date > now) return holidays[i];
    }
    return null;
}

const dayInput = document.getElementById('dayInput');
for(let d=1; d<=31; d++){
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    dayInput.appendChild(opt);
}

const thingsToDoBox = document.getElementById('things-to-do');
thingsToDoBox.value = localStorage.getItem('thingsToDo') || '';
thingsToDoBox.addEventListener('input', () => {
    localStorage.setItem('thingsToDo', thingsToDoBox.value);
});

function getUserBirthday() {
    let stored = localStorage.getItem('userBirthdayMMDD');
    if (stored) {
        let parts = stored.split('-');
        let month = parseInt(parts[0]);
        let day = parseInt(parts[1]);
        if(!isNaN(month) && !isNaN(day)) {
            return {month, day};
        }
    }
    return null;
}

// -- CUSTOM EVENT STORAGE --
function getCustomEvents() {
    try {
        const arr = JSON.parse(localStorage.getItem('customEvents') || '[]');
        const today = new Date();
        today.setHours(0,0,0,0);
        const filtered = arr.filter(ev => {
            const evDate = new Date(ev.date + 'T00:00:00');
            return evDate >= today;
        });
        if (filtered.length !== arr.length) localStorage.setItem('customEvents', JSON.stringify(filtered));
        return filtered;
    } catch { return []; }
}

function addCustomEvent(name, dateStr) {
    let evts = getCustomEvents();
    evts.push({ name, date: dateStr });
    localStorage.setItem('customEvents', JSON.stringify(evts));
}

function removeCustomEvent(idx) {
    let evts = getCustomEvents();
    evts.splice(idx, 1);
    localStorage.setItem('customEvents', JSON.stringify(evts));
    updateHolidayCountdowns();
}

// -- MUSIC PLAYLIST STORAGE (OPTIMIZED) --
function getPlaylistMetadata() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_CONFIG.PLAYLIST_KEY) || '[]');
    } catch { return []; }
}

function savePlaylistMetadata(playlist) {
    try {
        localStorage.setItem(STORAGE_CONFIG.PLAYLIST_KEY, JSON.stringify(playlist));
    } catch (e) {
        console.error('Failed to save playlist metadata:', e);
    }
}

function getSongDataUrl(songId) {
    try {
        return localStorage.getItem(STORAGE_CONFIG.PREFIX + songId);
    } catch { return null; }
}

function saveSongDataUrl(songId, dataUrl) {
    const info = getStorageInfo();
    if (dataUrl.length > info.available) {
        throw new Error('Not enough storage space');
    }
    try {
        localStorage.setItem(STORAGE_CONFIG.PREFIX + songId, dataUrl);
    } catch (e) {
        console.error('Failed to save song:', e);
        throw e;
    }
}

function addToPlaylist(title, dataUrl) {
    const playlist = getPlaylistMetadata();
    const songId = 'song_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    try {
        saveSongDataUrl(songId, dataUrl);
        playlist.push({ id: songId, title });
        savePlaylistMetadata(playlist);
        updateStorageDisplay();
    } catch (e) {
        throw new Error('Failed to save song: ' + e.message);
    }
}

function removeSongFromPlaylist(idx) {
    const playlist = getPlaylistMetadata();
    const song = playlist[idx];
    
    try {
        localStorage.removeItem(STORAGE_CONFIG.PREFIX + song.id);
        playlist.splice(idx, 1);
        savePlaylistMetadata(playlist);
        updateStorageDisplay();
        updateMusicPlayer();
        showManagePlaylistPopup();
    } catch (e) {
        console.error('Failed to remove song:', e);
    }
}

function getCountdownText(targetDate, currentDate = null) {
    const now = currentDate || new Date();
    let diff = targetDate - now;
    if (diff < 0) return "Passed!";
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    let mins = Math.floor((diff / (1000 * 60)) % 60);
    let secs = Math.floor((diff / 1000) % 60);
    return `${days} days, ${hours} hours, ${mins} mins, ${secs} secs`;
}

function updateHolidayCountdowns() {
    const eventsElem = document.getElementById('holiday-events');
    eventsElem.innerHTML = "";
    const now = new Date();

    const nextHoliday = findNextHoliday(now);
    if (nextHoliday) {
        let countdown = getCountdownText(nextHoliday.date, now);
        let li = document.createElement('li');
        li.innerHTML = `<strong>${nextHoliday.name} :</strong> ${countdown}`;
        eventsElem.appendChild(li);
    } else {
        let li = document.createElement('li');
        li.textContent = "No upcoming holidays found.";
        eventsElem.appendChild(li);
    }

    let bday = getUserBirthday();
    if (bday) {
        let thisMonth = now.getMonth() + 1;
        let today = now.getDate();
        let bYear = (thisMonth > bday.month) || (thisMonth === bday.month && today > bday.day) ? now.getFullYear() + 1 : now.getFullYear();
        let birthdayDate = new Date(bYear, bday.month - 1, bday.day, 0, 0, 0);
        let countdown = getCountdownText(birthdayDate, now);
        let li = document.createElement('li');
        li.innerHTML = `<strong>🎂 My Birthday :</strong> ${countdown}`;
        eventsElem.appendChild(li);
    }

    const customEvents = getCustomEvents();
    customEvents.forEach((ev, i) => {
        let evDate = new Date(ev.date + 'T00:00:00');
        if (isNaN(evDate.getTime())) return;
        let countdown = getCountdownText(evDate, now);
        let li = document.createElement('li');
        li.innerHTML = `<strong> ${ev.name} :</strong> ${countdown} `;
        eventsElem.appendChild(li);
    });
}

setInterval(updateHolidayCountdowns, 1000);
updateHolidayCountdowns();

// --- Elements for popups ---
const bgPopup = document.getElementById('bgPopup');
const bgFileInput = document.getElementById('bgFileInput');
const bgUploadBtn = document.getElementById('bgUploadBtn');
const bgPreview = document.getElementById('bgPreview');
const bgUrlInput = document.getElementById('bgUrlInput');
const bgUrlSet = document.getElementById('bgUrlSet');
const bgUrlCancel = document.getElementById('bgUrlCancel');
const bgUrlError = document.getElementById('bgUrlError');
const birthdayPopup = document.getElementById('birthdayPopup');
const monthInput = document.getElementById('monthInput');
const birthdaySet = document.getElementById('birthdaySet');
const birthdayCancel = document.getElementById('birthdayCancel');
const birthdayError = document.getElementById('birthdayError');

const manageEventsPopup = document.getElementById('manageEventsPopup');
const manageEventsClose = document.getElementById('manageEventsClose');
const manageEventsList = document.getElementById('manage-events-list');
const noCustomEventsEl = document.getElementById('no-custom-events');
const customEventName = document.getElementById('customEventName');
const customEventDate = document.getElementById('customEventDate');
const eventAdd = document.getElementById('eventAdd');
const eventError = document.getElementById('eventError');

const addMusicPopup = document.getElementById('addMusicPopup');
const musicFileInput = document.getElementById('musicFileInput');
const musicUploadArea = document.getElementById('music-upload-area');
const uploadProgress = document.getElementById('upload-progress');
const musicCancel = document.getElementById('musicCancel');
const musicError = document.getElementById('musicError');

const managePlaylistPopup = document.getElementById('managePlaylistPopup');
const managePlaylistClose = document.getElementById('managePlaylistClose');
const playlistList = document.getElementById('playlist-list');
const noPlaylistSongsEl = document.getElementById('no-playlist-songs');

const settingsDropdown = document.getElementById('settingsDropdown');
const eventMenuButton = document.getElementById('eventMenuButton');
const ddChangeBg = document.getElementById('dd-change-bg');
const ddSetBirthday = document.getElementById('dd-set-birthday');
const ddManageEvents = document.getElementById('dd-manage-events');
const ddAddMusic = document.getElementById('dd-add-music');
const ddManagePlaylist = document.getElementById('dd-manage-playlist');
const ddHelp = document.getElementById('dd-help');

const helpPopup = document.getElementById('helpPopup');
const helpFormIframe = document.getElementById('helpFormIframe');
const helpClose = document.getElementById('helpClose');

// Music Player Elements
const musicPlayer = document.getElementById('music-player');
const audioPlayer = new Audio();
const playPauseBtn = document.getElementById('playPauseBtn');
const nextBtn = document.getElementById('nextBtn');
const currentSongDisplay = document.getElementById('current-song-display');
const musicTimeDisplay = document.getElementById('music-time-display');
const songProgressBar = document.getElementById('song-progress-bar');
const songProgress = document.getElementById('song-progress');
const albumArtDisplay = document.getElementById('album-art-display');

let currentSongIndex = 0;

// Focus management helpers for overlays
function showOverlay(overlay) {
    if (!overlay) return;
    overlay.__previouslyFocused = document.activeElement;
    overlay.style.display = 'flex';
    overlay.querySelector('.modal')?.focus();
    hideDropdown();
}

function hideOverlay(overlay) {
    if (!overlay) return;
    overlay.style.display = 'none';
    try {
        if (overlay.__previouslyFocused && typeof overlay.__previouslyFocused.focus === 'function') {
            overlay.__previouslyFocused.focus();
        }
    } catch(e){}
}

// Welcome popup logic
const welcomePopup = document.getElementById('welcomePopup');
const welcomeClose = document.getElementById('welcomeClose');
function showWelcomePopup() { showOverlay(welcomePopup); }
function hideWelcomePopup() { hideOverlay(welcomePopup); }
welcomeClose.addEventListener('click', hideWelcomePopup);

window.addEventListener('DOMContentLoaded', () => {
    showWelcomePopup();
    updateMusicPlayer();
    updateStorageDisplay();
});

// Generic show/hide helpers for named popups
function showBgPopup(defaultUrl = '') {
    hideDropdown();
    bgUrlInput.value = defaultUrl;
    bgUrlError.textContent = '';
    bgPreview.style.display = 'none';
    bgPreview.src = '';
    bgFileInput.value = '';
    showOverlay(bgPopup);
    bgUrlInput.focus();
}
function hideBgPopup() { hideOverlay(bgPopup); }

function showBirthdayPopup() {
    hideDropdown();
    let raw = localStorage.getItem('userBirthdayMMDD');
    if (raw) {
        let parts = raw.split('-');
        if(parts.length === 2) {
            monthInput.value = parts[0];
            dayInput.value = parts[1];
        }
    } else {
        monthInput.value = "";
        dayInput.value = "";
    }
    birthdayError.textContent = '';
    showOverlay(birthdayPopup);
    monthInput.focus();
}
function hideBirthdayPopup() { hideOverlay(birthdayPopup); }

function showAddMusicPopup() {
    hideDropdown();
    musicFileInput.value = "";
    uploadProgress.innerHTML = "";
    uploadProgress.classList.remove('showing');
    musicError.textContent = "";
    updateStorageDisplay();
    showOverlay(addMusicPopup);
}
function hideAddMusicPopup() { hideOverlay(addMusicPopup); }

function showManageEventsPopup() {
    hideDropdown();
    // Clear input fields
    customEventName.value = "";
    customEventDate.value = "";
    eventError.textContent = "";
    
    const evts = getCustomEvents();
    manageEventsList.innerHTML = "";
    if (!evts.length) {
        noCustomEventsEl.style.display = "block";
    } else {
        noCustomEventsEl.style.display = "none";
        evts.forEach((ev, i) => {
            const li = document.createElement('li');
            const left = document.createElement('div');
            left.textContent = `${ev.name} (${ev.date})`;
            const right = document.createElement('div');
            const delBtn = document.createElement('button');
            delBtn.textContent = "Delete";
            delBtn.className = "small danger";
            delBtn.style.padding = "4px 8px";
            delBtn.type = "button";
            delBtn.onclick = () => {
                if (confirm(`Delete "${ev.name}"?`)) {
                    removeCustomEvent(i);
                    showManageEventsPopup();
                }
            };
            right.appendChild(delBtn);
            li.appendChild(left);
            li.appendChild(right);
            manageEventsList.appendChild(li);
        });
    }
    showOverlay(manageEventsPopup);
}
function hideManageEventsPopup() { hideOverlay(manageEventsPopup); }

function showManagePlaylistPopup() {
    hideDropdown();
    const playlist = getPlaylistMetadata();
    playlistList.innerHTML = "";
    if (!playlist.length) {
        noPlaylistSongsEl.style.display = "block";
    } else {
        noPlaylistSongsEl.style.display = "none";
        playlist.forEach((song, i) => {
            const li = document.createElement('li');
            const songInfo = document.createElement('div');
            songInfo.className = 'song-info';
            
            const icon = document.createElement('div');
            icon.className = 'song-icon';
            icon.textContent = '🎵';
            songInfo.appendChild(icon);
            
            const titleEl = document.createElement('div');
            titleEl.className = 'song-title';
            titleEl.textContent = song.title;
            songInfo.appendChild(titleEl);
            
            const delBtn = document.createElement('button');
            delBtn.textContent = "Remove";
            delBtn.className = "small danger";
            delBtn.style.padding = "4px 8px";
            delBtn.type = "button";
            delBtn.onclick = () => {
                if (confirm(`Remove "${song.title}" from playlist?`)) {
                    removeSongFromPlaylist(i);
                }
            };
            
            li.appendChild(songInfo);
            li.appendChild(delBtn);
            playlistList.appendChild(li);
        });
    }
    showOverlay(managePlaylistPopup);
}
function hideManagePlaylistPopup() { hideOverlay(managePlaylistPopup); }

// Help popup
function showHelpPopup() {
    hideDropdown();
    helpFormIframe.src = "https://forms.gle/RN2VvKyrCMixseNN8";
    showOverlay(helpPopup);
}
function hideHelpPopup() {
    helpFormIframe.src = "";
    hideOverlay(helpPopup);
}

// Dropdown toggle/close helpers
function toggleDropdown() {
    if (settingsDropdown.style.display === "none" || settingsDropdown.style.display === "") {
        settingsDropdown.style.display = "block";
        settingsDropdown.setAttribute('aria-hidden', 'false');
    } else {
        settingsDropdown.style.display = "none";
        settingsDropdown.setAttribute('aria-hidden', 'true');
    }
}
function hideDropdown() {
    settingsDropdown.style.display = "none";
    settingsDropdown.setAttribute('aria-hidden', 'true');
}

// Bind dropdown actions
eventMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
});
ddChangeBg.addEventListener('click', () => showBgPopup(localStorage.getItem('customBgImg') || ''));
ddSetBirthday.addEventListener('click', () => showBirthdayPopup());
ddManageEvents.addEventListener('click', () => showManageEventsPopup());
ddAddMusic.addEventListener('click', () => showAddMusicPopup());
ddManagePlaylist.addEventListener('click', () => showManagePlaylistPopup());
ddHelp.addEventListener('click', () => showHelpPopup());

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    let target = e.target;
    if (!settingsDropdown.contains(target) && target !== eventMenuButton) {
        hideDropdown();
    }
});

// Close overlays on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.overlay').forEach(ol => {
            if (ol.style.display === 'flex') {
                if (ol.id === 'helpPopup') hideHelpPopup();
                else ol.style.display = 'none';
                try {
                    if (ol.__previouslyFocused && typeof ol.__previouslyFocused.focus === 'function') ol.__previouslyFocused.focus();
                } catch(e){}
            }
        });
        hideDropdown();
    }
});

// bg popup: upload flow
bgUploadBtn.addEventListener('click', () => {
    bgFileInput.click();
});
bgFileInput.addEventListener('change', function(e) {
    const file = e.target.files && e.target.files[0];
    bgUrlError.textContent = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        bgUrlError.textContent = 'Please select an image file.';
        return;
    }
    const reader = new FileReader();
    reader.onload = function() {
        const dataUrl = reader.result;
        bgPreview.src = dataUrl;
        bgPreview.style.display = 'block';
        try {
            localStorage.setItem('customBgImg', dataUrl);
            document.body.style.backgroundImage = `url('${dataUrl}')`;
            setTimeout(hideBgPopup, 600);
        } catch (err) {
            bgUrlError.textContent = 'Image too large to save locally.';
            document.body.style.backgroundImage = `url('${dataUrl}')`;
            setTimeout(hideBgPopup, 600);
        }
    };
    reader.onerror = function() {
        bgUrlError.textContent = 'Failed to read file.';
    };
    reader.readAsDataURL(file);
});

// bg popup: link flow
bgUrlCancel.addEventListener('click', hideBgPopup);
bgUrlSet.addEventListener('click', () => {
    let url = bgUrlInput.value.trim();
    bgUrlError.textContent = '';
    if (!url) {
        bgUrlError.textContent = 'Please enter an image link!';
        return;
    }
    if (!/^https?:\/\/.+/.test(url)) {
        bgUrlError.textContent = 'Please enter a valid URL starting with http or https';
        return;
    }
    const img = new Image();
    img.onload = function() {
        bgPreview.src = url;
        bgPreview.style.display = 'block';
        try {
            localStorage.setItem('customBgImg', url);
        } catch (err) {}
        document.body.style.backgroundImage = `url('${url}')`;
        hideBgPopup();
    };
    img.onerror = function() {
        bgUrlError.textContent = 'Could not load image from that link.';
    };
    img.src = url;
});
bgUrlInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') bgUrlSet.click();
});

// birthday handlers
birthdaySet.addEventListener('click', () => {
    if (!monthInput.value || !dayInput.value) {
        birthdayError.textContent = 'Please select both month and day!';
        return;
    }
    let mmdd = `${monthInput.value}-${dayInput.value}`;
    localStorage.setItem('userBirthdayMMDD', mmdd);
    hideBirthdayPopup();
    updateHolidayCountdowns();
});
birthdayCancel.addEventListener('click', () => {
    localStorage.removeItem('userBirthdayMMDD');
    hideBirthdayPopup();
    updateHolidayCountdowns();
});
monthInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') birthdaySet.click();
});
dayInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') birthdaySet.click();
});

// event add handlers
eventAdd.addEventListener('click', function() {
    let name = customEventName.value.trim();
    let dateStr = customEventDate.value;
    if (!name || !dateStr) {
        eventError.textContent = "Please enter both event name and event date!";
        return;
    }
    addCustomEvent(name, dateStr);
    customEventName.value = "";
    customEventDate.value = "";
    eventError.textContent = "";
    showManageEventsPopup();
    updateHolidayCountdowns();
});
customEventName.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') customEventDate.focus();
});
customEventDate.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') eventAdd.click();
});

manageEventsClose.addEventListener('click', hideManageEventsPopup);

// Music upload handlers
musicUploadArea.addEventListener('click', () => {
    musicFileInput.click();
});

musicUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    musicUploadArea.classList.add('dragging');
});

musicUploadArea.addEventListener('dragleave', () => {
    musicUploadArea.classList.remove('dragging');
});

musicUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    musicUploadArea.classList.remove('dragging');
    handleMusicFiles(e.dataTransfer.files);
});

musicFileInput.addEventListener('change', (e) => {
    handleMusicFiles(e.target.files);
});

async function handleMusicFiles(files) {
    musicError.textContent = '';
    uploadProgress.innerHTML = '';
    uploadProgress.classList.add('showing');
    
    let successCount = 0;
    let errorCount = 0;
    const mp3Files = Array.from(files).filter(f => f.type === 'audio/mpeg' || f.name.endsWith('.mp3'));
    
    for (let file of mp3Files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const dataUrl = e.target.result;
                const fileName = file.name.replace('.mp3', '').replace(/[_-]/g, ' ');
                addToPlaylist(fileName, dataUrl);
                successCount++;
                
                const progressItem = document.createElement('div');
                progressItem.className = 'progress-item success';
                progressItem.textContent = `✓ ${fileName}`;
                uploadProgress.appendChild(progressItem);
                
                if (successCount + errorCount === mp3Files.length) {
                    updateMusicPlayer();
                    if (errorCount === 0) {
                        setTimeout(hideAddMusicPopup, 1500);
                    }
                }
            } catch (err) {
                errorCount++;
                const progressItem = document.createElement('div');
                progressItem.className = 'progress-item error';
                progressItem.textContent = `✗ ${file.name}: ${err.message}`;
                uploadProgress.appendChild(progressItem);
                
                if (successCount + errorCount === mp3Files.length) {
                    updateMusicPlayer();
                }
            }
        };
        reader.readAsDataURL(file);
    }
    
    if (mp3Files.length === 0) {
        musicError.textContent = 'No MP3 files found. Please upload MP3 files only.';
    }
}

musicCancel.addEventListener('click', hideAddMusicPopup);
managePlaylistClose.addEventListener('click', hideManagePlaylistPopup);
helpClose.addEventListener('click', hideHelpPopup);

// Music Player Functions
function updateMusicPlayer() {
    const playlist = getPlaylistMetadata();
    if (playlist.length === 0) {
        musicPlayer.classList.remove('active');
        audioPlayer.src = '';
        currentSongDisplay.textContent = 'No song playing';
        musicTimeDisplay.textContent = '0:00 / 0:00';
        albumArtDisplay.textContent = '🎵';
        return;
    }
    
    musicPlayer.classList.add('active');
    const song = playlist[currentSongIndex];
    const dataUrl = getSongDataUrl(song.id);
    audioPlayer.src = dataUrl;
    currentSongDisplay.textContent = song.title;
    albumArtDisplay.textContent = '🎵';
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.textContent = '⏸ Pause';
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶ Play';
    }
});

nextBtn.addEventListener('click', () => {
    const playlist = getPlaylistMetadata();
    if (playlist.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        updateMusicPlayer();
        audioPlayer.play();
        playPauseBtn.textContent = '⏸ Pause';
    }
});

audioPlayer.addEventListener('play', () => {
    playPauseBtn.textContent = '⏸ Pause';
});

audioPlayer.addEventListener('pause', () => {
    playPauseBtn.textContent = '▶ Play';
});

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        songProgressBar.style.width = percent + '%';
        musicTimeDisplay.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
    }
});

audioPlayer.addEventListener('ended', () => {
    nextBtn.click();
});

songProgress.addEventListener('click', (e) => {
    if (audioPlayer.duration) {
        const rect = songProgress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
});

function startClock() {
    const clock