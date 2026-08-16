const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const today = new Date();
const todayIdx = today.getDay();

const greetings = [
  "Rise & burn ☀️",
  "Phoenix mode 🔥",
  "Glow day ✦",
  "Discipline day ☀️",
  "Built different 🔥"
];

document.getElementById('greetingLabel').textContent =
  greetings[new Date().getDate() % greetings.length];

document.getElementById('dateLabel').textContent =
  "Rebuild. Rise. Repeat. • " +
  today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
const SCHEDULE = {
  1: {
    label: 'Easy Treadmill + Lower Body',
    color: '#ff6b6b',
    time: 'After Work',
    location: 'Gym',
    sections: [
      { name: 'Warm-up', exercises: ['5-10 min incline walk'] },
      { name: 'Run', exercises: ['3-5 km easy run'] },
      { name: 'Intermediate Area', exercises: ['Goblet Squats', 'RDLs', 'Leg raises'] },
      { name: 'Normal Area', exercises: ['Assisted Pull-ups', 'Assisted Hip Dips'] }
    ]
  },

  2: {
    label: 'Intervals + Core',
    color: '#ffcc44',
    time: 'After Work',
    location: 'Gym',
    sections: [
      { name: 'Warm-up', exercises: ['5-10 min incline walk'] },
      { name: 'Run', exercises: ['Garmin built-in 400m'] },
      { name: 'Abs routine', exercises: ['Russian twists', 'In and outs', 'Heel touches', 'Knee/tabletop crunches', '1 min plank'] }
    ]
  },

  3: {
    label: 'Upper Body',
    color: '#6bc5ff',
    time: 'After Work',
    location: 'Gym',
    sections: [
      { name: 'Warm-up', exercises: ['5-10 min incline walk'] },
      { name: 'Intermediate Area', exercises: ['Dumbell Shoulder Press', 'Face pulls', 'Overhead tricep extension', 'Lateral raises', 'Tricep Pushdown', 'Lat pulldown'] },
      { name: 'Normal Area', exercises: ['Assisted Pull-ups', 'Chest-supported row'] }, 
      { name: 'Optional', exercises: ['15 min bike'] }
    ]
  },

  4: {
    label: 'Recovery Run',
    color: '#c8f55a',
    time: 'Flexible',
    location: 'Outdoors / Gym',
    sections: [
      { name: 'Cardio', exercises: ['4-6 km easy run'] },
      { name: 'Stretch', exercises: ['5-10 min static stretches'] }
    ]
  },

  5: {
    label: 'Leg Strength',
    color: '#b39ddb',
    time: 'Flexible',
    location: 'Gym',
    sections: [
      { name: 'Warm-up', exercises: ['5-10 min incline walk'] },
      { name: 'Intermediate Area', exercises: ['Goblet Squats', 'RDLs', 'Leg raises', 'Calf raises'] },
      { name: 'Normal Area', exercises: ['Dead hang', 'Leg curls', 'Hip abductors', 'Hip adductors'] },
      { name: 'Finisher', exercises: ['1 km run OR 15–20 min incline walk'] }
    ]
  },

  6: {
    label: 'Long Run',
    color: '#ffb347',
    time: 'Flexible',
    location: 'Anywhere',
    sections: [
      { name: 'Long Run', exercises: ['5km'] }
    ]
  },

  0: {
    label: 'Recovery & Rest',
    color: '#888',
    time: 'All day',
    rest: true,
    sections: [
      { name: 'Gentle movement', exercises: ['Walk', 'Stretch'] }
    ]
  }
};

let currentDay = todayIdx;
let checkedExercises = JSON.parse(localStorage.getItem('checked') || '{}');
let foodLog = JSON.parse(localStorage.getItem('foodLog') || '[]');
let waterLog = JSON.parse(localStorage.getItem('waterLog') || '{}');
let walkLog = JSON.parse(localStorage.getItem('walkLog') || '[]');
let ntfyTopic = localStorage.getItem('ntfyTopic') || '';
let currentModal = '';

const todayKey = today.toISOString().split('T')[0];

function saveChecked() { localStorage.setItem('checked', JSON.stringify(checkedExercises)); }

function renderDayNav() {
  const nav = document.getElementById('dayNav');
  nav.innerHTML = '';
  const order = [1,2,3,4,5,6,0];
  order.forEach(d => {
    const chip = document.createElement('button');
    chip.className = 'day-chip' + (d === currentDay ? ' active' : '');
    chip.textContent = DAYS[d].slice(0,3);
    chip.onclick = () => { currentDay = d; renderDayNav(); renderWorkout(); };
    nav.appendChild(chip);
  });
}

function renderWorkout() {
  const content = document.getElementById('workoutContent');
  const day = SCHEDULE[currentDay];
  if (!day) { content.innerHTML = ''; return; }

  let html = `<div class="day-label">
    <div class="day-dot" style="background:${day.color}"></div>
    <div>
      <div class="day-title">${day.label.split('—')[1]?.trim() || day.label}</div>
      <div class="day-subtitle">⏰ ${day.time}</div>
    </div>
  </div>`;

  if (day.rest) {
    html += `<div class="rest-card">
      <div class="rest-emoji">🌿</div>
      <h2>Rest & Reset</h2>
      <p>Walk + stretch. Recovery is part of the process.</p>
    </div>`;
  }

  const dayKey = `${todayKey}-${currentDay}`;
  let total = 0, done = 0;

  day.sections.forEach(sec => {
    html += `<div class="section-label">${sec.name}</div>`;
    sec.exercises.forEach(ex => {
      total++;
      const key = `${dayKey}-${ex}`;
      const checked = checkedExercises[key];
      if (checked) done++;
      html += `<div class="exercise-item${checked ? ' done' : ''}" onclick="toggleEx('${key}', this)">
        <div class="ex-check"><span class="ex-check-icon">✓</span></div>
        <div class="ex-name">${ex}</div>
      </div>`;
    });
  });

  const pct = total > 0 ? Math.round((done/total)*100) : 0;
  html += `<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
  <div class="progress-label">${done} of ${total} exercises done (${pct}%)</div>`;

  content.innerHTML = html;
}

function toggleEx(key, el) {
  checkedExercises[key] = !checkedExercises[key];
  saveChecked();
  renderWorkout();
}

function renderLog() {
  const todayFood = foodLog.filter(f => f.date === todayKey);
  const foodEl = document.getElementById('foodEntries');
  if (todayFood.length === 0) {
    foodEl.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:8px 0;">Nothing logged yet today.</div>';
  } else {
    foodEl.innerHTML = todayFood.map((f,i) => `
      <div class="log-entry">
        <div>
          <div class="log-entry-text">${f.text}</div>
          <div class="log-entry-meta">${f.time}</div>
        </div>
        <button class="delete-btn" onclick="deleteFood(${foodLog.indexOf(f)})">✕</button>
      </div>`).join('');
  }

  const glasses = waterLog[todayKey] || 0;
  const tracker = document.getElementById('waterTracker');
  let glassHTML = '';
  for (let i = 0; i < 10; i++) {
    glassHTML += `<div class="water-glass${i < glasses ? ' filled' : ''}" onclick="setWater(${i+1})">💧</div>`;
  }
  tracker.innerHTML = glassHTML;
  document.getElementById('waterCount').textContent = `${glasses} glass${glasses !== 1 ? 'es' : ''} today (goal: 8–10)`;

  const todayWalk = walkLog.filter(w => w.date === todayKey);
  const walkEl = document.getElementById('walkEntries');
  if (todayWalk.length === 0) {
    walkEl.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:8px 0;">No walks logged today.</div>';
  } else {
    walkEl.innerHTML = todayWalk.map(w => `
      <div class="log-entry">
        <div>
          <div class="log-entry-text">${w.text}</div>
          <div class="log-entry-meta">${w.time}</div>
        </div>
      </div>`).join('');
  }
}

function addWater() {
  const cur = waterLog[todayKey] || 0;
  waterLog[todayKey] = Math.min(cur + 1, 10);
  localStorage.setItem('waterLog', JSON.stringify(waterLog));
  renderLog();
}

function setWater(n) {
  waterLog[todayKey] = n;
  localStorage.setItem('waterLog', JSON.stringify(waterLog));
  renderLog();
}

function deleteFood(idx) {
  foodLog.splice(idx, 1);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  renderLog();
}

function openModal(type) {
  currentModal = type;
  const titles = { food: 'Log food', walk: 'Log walk' };
  const placeholders = { food: 'e.g. Chicken & rice, protein shake...', walk: 'e.g. 30 min evening walk...' };
  document.getElementById('modalTitle').textContent = titles[type];
  document.getElementById('modalInput').placeholder = placeholders[type];
  document.getElementById('modalInput').value = '';
  document.getElementById('modalOverlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('modalInput').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function saveLog() {
  const val = document.getElementById('modalInput').value.trim();
  if (!val) return;
  const entry = { text: val, date: todayKey, time: new Date().toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'}) };
  if (currentModal === 'food') {
    foodLog.push(entry);
    localStorage.setItem('foodLog', JSON.stringify(foodLog));
  } else {
    walkLog.push(entry);
    localStorage.setItem('walkLog', JSON.stringify(walkLog));
  }
  closeModal();
  renderLog();
}

function generateTopic() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'myfitness-';
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random()*chars.length)];
  return result;
}

function renderReminders() {
  const setup = document.getElementById('ntfySetup');
  if (!ntfyTopic) {
    ntfyTopic = generateTopic();
    localStorage.setItem('ntfyTopic', ntfyTopic);
  }

  setup.innerHTML = `<div class="setup-card">
    <h3>Set up push notifications</h3>
    <p>Install the free <strong>ntfy</strong> app on your iPhone, then subscribe to your personal topic below. You'll get all your reminders as real push notifications.</p>
    <ol class="setup-steps">
      <li><span class="step-num">1</span><span>Download <strong>ntfy</strong> from the App Store (free, by Philipp Heckel)</span></li>
      <li><span class="step-num">2</span><span>Open ntfy → tap <strong>+</strong> → Subscribe to topic:</span></li>
    </ol>
    <div class="topic-display">${ntfyTopic}</div>
    <ol class="setup-steps" start="3">
      <li><span class="step-num">3</span><span>Add this page to your iPhone home screen (Share → Add to Home Screen)</span></li>
      <li><span class="step-num">4</span><span>Done! Test it below 👇</span></li>
    </ol>
  </div>`;

  document.getElementById('testNotifSection').innerHTML = `
    <div style="margin-top:16px">
      <p class="section-label">Test your notifications</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn btn-primary" onclick="sendTestNotif()">Send test notification</button>
        <button class="btn btn-secondary" onclick="scheduleReminders()">Activate all reminders</button>
      </div>
      <p style="font-size:11px;color:var(--muted);margin-top:12px;line-height:1.6;">Reminders run while this app is open or in the background as a PWA. For all-day reliability, keep the PWA installed on your home screen.</p>
    </div>`;
}

async function sendNotif(title, message) {
  if (!ntfyTopic) return;

  const url = `https://ntfy.sh/${ntfyTopic}?title=${encodeURIComponent(title)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: message
    });

    if (!res.ok) {
      alert('Notification failed: ' + res.status);
    }
  } catch (e) {
    console.log('ntfy error', e);
    alert('Notification failed. Check console.');
  }
}

async function sendTestNotif() {
  const topic = localStorage.getItem('ntfyTopic');

  alert('Sending to topic: ' + topic);

  try {
    const res = await fetch('https://ntfy.sh/' + topic, {
      method: 'POST',
      body: 'Hello from my fitness website'
    });

    alert('Status: ' + res.status);
  } catch (err) {
    alert('Error: ' + err.message);
    console.log(err);
  }
}

function getDelayUntil(hour, minute = 0) {
  const now = new Date();
  const target = new Date();

  target.setHours(hour, minute, 0, 0);

  if (target <= now) {
    return null;
  }

  const diffMs = target - now;
  const diffMinutes = Math.ceil(diffMs / 60000);

  return diffMinutes + 'm';
}

async function sendScheduledNotif(title, message, delay) {
  if (!ntfyTopic || !delay) return;

  const url =
    `https://ntfy.sh/${ntfyTopic}` +
    `?title=${encodeURIComponent(title)}` +
    `&delay=${encodeURIComponent(delay)}`;

  const res = await fetch(url, {
    method: 'POST',
    body: message
  });

  if (!res.ok) {
    throw new Error('Failed: ' + res.status);
  }
}

async function scheduleReminders() {
  try {
    const todayScheduledKey = 'remindersScheduled-' + todayKey;

    if (localStorage.getItem(todayScheduledKey) === 'yes') {
      alert('Reminders are already scheduled for today.');
      return;
    }

    const reminders = [
      { title: '🍗 Protein meal', message: 'Time for your 1pm protein meal.', hour: 13 },
      { title: '🥜 Snack time', message: 'Keep it light — snack time.', hour: 15 },
      { title: '🌅 Light dinner', message: 'Wind down with a light dinner.', hour: 19 },
      { title: '🚶 Evening walk', message: 'Time for your evening walk.', hour: 20 },
      { title: '⏰ 10 PM TEST', message: 'TESTING', hour: 22 }
    ];

    for (let h = 9; h <= 20; h++) {
      reminders.push({
        title: '💧 Drink water',
        message: 'Hydration check — sip some water.',
        hour: h
      });
    }

    let scheduledCount = 0;

    for (const r of reminders) {
      const delay = getDelayUntil(r.hour, 0);

      if (delay) {
        await sendScheduledNotif(r.title, r.message, delay);
        scheduledCount++;
      }
    }

    localStorage.setItem(todayScheduledKey, 'yes');
    alert(`${scheduledCount} reminders scheduled for today. You can close the app now.`);
  } catch (err) {
    alert('Could not schedule reminders: ' + err.message);
    console.log(err);
  }
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  if (name === 'log') renderLog();
  if (name === 'reminders') renderReminders();
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('modalInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') saveLog();
});

renderDayNav();
renderWorkout();
