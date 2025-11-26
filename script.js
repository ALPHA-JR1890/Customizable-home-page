x// Utility functions for holidays/etc.
function getUSHolidays(year) {
    const holidays = [
        { name: "🎄 Christmas Day", date: new Date(year, 11, 25) },
        { name: "🎉 New Year's Day", date: new Date(year + 1, 0, 1) },
        { name: "🛑 Martin Luther King Jr Day", date: mlkDay(year + 1) },
        { name: "🇺🇸 Presidents Day", date: presidentsDay(year + 1) },
        { name: "🐰 Easter", date: easter(year + 1) },
        { name: "🌷 Memorial Day", date: memorialDay(year + 1) },
        { name: "🎆 Independence Day", date: new Date(year + 1, 6, 4) },
        { name: "🍁 Labor Day", date: laborDay(year + 1) },
        { name: "🦃 Thanksgiving", date: thanksgiving(year + 1) },
    ];
    return holidays;
}
function mlkDay(year) { return nthWeekdayOfMonth(year, 0, 1, 3); }
function presidentsDay(year) { return nthWeekdayOfMonth(year, 1, 1, 3); }
function memorialDay(year) { return lastWeekdayOfMonth(year, 4, 1); }
function laborDay(year) { return nthWeekdayOfMonth(year, 8, 1, 1); }
function thanksgiving(year) { return nthWeekdayOfMonth(year, 10, 4, 4); }
function nthWeekdayOfMonth(year, month, weekday, n) {
    let date = new Date(year, month, 1), count = 0;
    while (date.getMonth() === month) {
        if (date.getDay() === weekday) {
            count++;
            if (count === n) return date;
        }
        date.setDate(date.getDate() + 1);
    }
    return null;
}
function lastWeekdayOfMonth(year, month, weekday) {
    let date = new Date(year, month + 1, 0);
    while (date.getDay() !== weekday) date.setDate(date.getDate() - 1);
    return date;
}
function easter(year) {
    var a = year % 19, b = Math.floor(year/100), c = year%100, d = Math.floor(b/4), e = b%4;
    var f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3), h = (19*a+b-d-g+15)%30;
    var i = Math.floor(c/4), k = c%4, l = (32+2*e+2*i-h-k)%7;
    var m = Math.floor((a+11*h+22*l)/451), month = Math.floor((h+l-7*m+114)/31)-1;
    var day = ((h+l-7*m+114)%31)+1;
    return new Date(year, month, day);
}

// Fill months/days for birthday popup
const monthInput = document.getElementById('monthInput');
const months = [
    "Month","January","February","March","April","May",
    "June","July","August","September","October","November","December"
];
months.forEach((m, i) => {
    let opt = document.createElement('option');
    opt.value = i ? i : "";
    opt.textContent = m;
    monthInput.appendChild(opt);
});
const dayInput = document.getElementById('dayInput');
for(let d=1; d<=31; d++){
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    dayInput.appendChild(opt);
}

// Things-to-do persistence
const thingsToDoBox = document.getElementById('things-to-do');
thingsToDoBox.value = localStorage.getItem('thingsToDo') || '';
thingsToDoBox.addEventListener('input', () => {
    localStorage.setItem('thingsToDo', thingsToDoBox.value);
});

// Utility for birthday
function getUserBirthday() {
    let stored = localStorage.getItem('userBirthdayMMDD');
    if (stored) {
        let parts = stored.split('-');
        let month = parseInt(parts[0]);
        let day = parseInt(parts[1]);
        if(!isNaN(month) && !isNaN(day)) return {month, day};
    }
    return null;
}
function findNextHoliday(now) {
    let thisYear = now.getFullYear();
    let holidays = getUSHolidays(thisYear);
    for (let i = 0; i < holidays.length; i++) {
        if (holidays[i].date > now) return holidays[i];
    }
    holidays = getUSHolidays(thisYear+1);
    return holidays[0];
}

// Custom Events logic
function getCustomEvents() {
    try {
        return JSON.parse(localStorage.getItem('customEvents') || '[]');
    } catch { return []; }
}
function addCustomEvent(name, dateStr) {
    let evts = getCustomEvents();
    evts.push({ name, date: dateStr });
    localStorage.setItem('customEvents', JSON.stringify(evts));
}

// Countdown
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
    }
    let bday = getUserBirthday();
    if (bday) {
        let bYear = (now.getMonth()+1 > bday.month) || (now.getMonth()+1 === bday.month && now.getDate() > bday.day) ? now.getFullYear() + 1 : now.getFullYear();
        let birthdayDate = new Date(bYear, bday.month - 1, bday.day, 0, 0, 0);
        let countdown = getCountdownText(birthdayDate, now);
        let li = document.createElement('li');
        li.innerHTML = `<strong>🎂 My Birthday :</strong> ${countdown}`;
        eventsElem.appendChild(li);
    }
    // Show all custom user events as countdowns
    const customEvents = getCustomEvents();
    for (let ev of customEvents) {
        let evDate = new Date(ev.date + 'T00:00:00');
        if (isNaN(evDate.getTime())) continue;
        let countdown = getCountdownText(evDate, now);
        let li = document.createElement('li');
        li.innerHTML = `<strong>📅 ${ev.name} :</strong> ${countdown}`;
        eventsElem.appendChild(li);
    }
}
setInterval(updateHolidayCountdowns, 1000);
updateHolidayCountdowns();

// Popup Logic
const bgPopup = document.getElementById('bgPopup');
const bgUrlInput = document.getElementById('bgUrlInput');
const bgUrlSet = document.getElementById('bgUrlSet');
const bgUrlCancel = document.getElementById('bgUrlCancel');
const bgUrlError = document.getElementById('bgUrlError');
const birthdayPopup = document.getElementById('birthdayPopup');
const birthdaySet = document.getElementById('birthdaySet');
const birthdayCancel = document.getElementById('birthdayCancel');
const birthdayError = document.getElementById('birthdayError');
const eventMenuButton = document.getElementById('eventMenuButton');
const eventPopup = document.getElementById('eventPopup');
const customEventName = document.getElementById('customEventName');
const customEventDate = document.getElementById('customEventDate');
const eventAdd = document.getElementById('eventAdd');
const eventCancel = document.getElementById('eventCancel');
const eventError = document.getElementById('eventError');

const welcomePopup = document.getElementById('welcomePopup');
const welcomeClose = document.getElementById('welcomeClose');

function showWelcomePopup() { welcomePopup.style.display = "flex"; }
function hideWelcomePopup() { welcomePopup.style.display = "none"; }
welcomeClose.addEventListener('click', hideWelcomePopup);
window.addEventListener('DOMContentLoaded', () => showWelcomePopup());

// Show popups
function showBgPopup(defaultUrl = '') {
    bgUrlInput.value = defaultUrl;
    bgUrlError.textContent = '';
    bgPopup.style.display = "flex";
    bgUrlInput.focus();
}
function hideBgPopup() { bgPopup.style.display = "none"; }
function showBirthdayPopup() {
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
    birthdayPopup.style.display = "flex";
    monthInput.focus();
}
function hideBirthdayPopup() { birthdayPopup.style.display = "none"; }
function showEventPopup() {
    customEventName.value = "";
    customEventDate.value = "";
    eventError.textContent = "";
    eventPopup.style.display = "flex";
    customEventName.focus();
}
function hideEventPopup() { eventPopup.style.display = "none"; }

// Main menu for "Upcoming Events"
eventMenuButton.addEventListener('click', function() {
    let menu = prompt(
        "Type:\n1 for Change Background\n2 for Set Birthday\n3 for Add Event",
        "1"
    );
    if (menu == "1") {
        showBgPopup(localStorage.getItem('customBgImg') || '');
    } else if (menu == "2") {
        showBirthdayPopup();
    } else if (menu == "3") {
        showEventPopup();
    }
});

bgUrlCancel.addEventListener('click', hideBgPopup);
bgUrlSet.addEventListener('click', () => {
    let url = bgUrlInput.value.trim();
    if (!url) {
        bgUrlError.textContent = 'Please enter an image link!';
        return;
    }
    if (!/^https?:\/\/.+/.test(url)) {
        bgUrlError.textContent = 'Please enter a valid URL starting with http or https';
        return;
    }
    document.body.style.backgroundImage = `url('${url}')`;
    localStorage.setItem('customBgImg', url);
    hideBgPopup();
});
bgUrlInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter') bgUrlSet.click();
});

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

eventAdd.addEventListener('click', function() {
    let name = customEventName.value.trim();
    let dateStr = customEventDate.value;
    if (!name || !dateStr) {
        eventError.textContent = "Please enter both event name and event date!";
        return;
    }
    addCustomEvent(name, dateStr);
    hideEventPopup();
    updateHolidayCountdowns();
});
eventCancel.addEventListener('click', function() {
    hideEventPopup();
});
customEventName.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') customEventDate.focus();
});
customEventDate.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') eventAdd.click();
});

// Background image persistence
window.addEventListener('DOMContentLoaded', function() {
    let customBg = localStorage.getItem('customBgImg');
    if (customBg) document.body.style.backgroundImage = `url('${customBg}')`;
});

// Live Clock
function startClock() {
    const clockElement = document.getElementById('countdown');
    function updateClock() {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
        clockElement.innerHTML = `${formattedDate}<br>${formattedTime}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
}
startClock();
