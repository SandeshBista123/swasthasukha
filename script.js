const API_KEY = 'nfIy16UWdgJ1bdz60r8skJd5s6oV6IBsoglRYKkh';
let totalConsumed = 0;
let isManualMode = false;

// 70+ Daily Inspiration Quotes
const quotes = [
    "Health is wealth. - Svasthya nai dhana ho.",
    "A journey of a thousand miles begins with a single step.",
    "Eat to live, not live to eat.",
    "Your body is a temple, keep it clean and pure.",
    "Consistency is the key to success.",
    "An apple a day keeps the doctor away.",
    "Drink more water; your skin and body will thank you.",
    "Small steps lead to big changes.",
    "Fitness is not a destination, it is a way of life.",
    "Take care of your body. It's the only place you have to live.",
    "Svasthya nai sabai bhanda thulo dhana ho.",
    "Healthy mind resides in a healthy body.",
    "Don't start a diet, start a lifestyle.",
    "Every bite you take is either fighting disease or feeding it.",
    "Your health is an investment, not an expense.",
    "Rest when you are tired, but never quit.",
    "Disciplined eating is a form of self-respect.",
    "Keep moving, keep growing.",
    "Health is the greatest gift.",
    "Today is a great day to be healthy!"
    "Move your body, calm your mind." 
     "Health is a daily choice."
     "Strong body, strong mind."
"What you eat today shapes your tomorrow."
"Healthy habits create healthy lives."
"Wellness is a journey, not a race."
"Your future self will thank you for today’s discipline."
"Sleep is not a luxury, it’s a necessity."
"Exercise is a celebration of what your body can do."
"A calm mind is part of good health."
"Healthy living is self-love in action."
"Food is fuel—choose wisely."
"Consistency beats motivation."
"Small healthy choices add up."
"Your body hears everything your mind says."
"Your health reflects your habits."
"Care for your body like it’s priceless—because it is."
"Wellness is the foundation of success."
"One step, one meal, one habit at a time."
"Healthy living is a lifelong commitment."
"Strength comes from consistency."
"Food can heal or harm—choose healing."
"A healthy body supports a powerful mind."
"Discipline creates results."

"Health is not temporary, habits shouldn’t be either."

"Your body works hard—treat it well."

"Well-being is built daily."

"Healthy living starts at home."

"Take charge of your health today."

"Fitness is a lifestyle, not a phase."

"Care now, comfort later."

"Swastha sharir, shanta man." (स्वस्थ शरीर, शान्त मन)
"Health is balance, not perfection."

"Discipline today brings freedom tomorrow."

"Take care of yourself; you matter."

"A healthy routine builds a healthy life."

"Mindful eating leads to mindful living."

"Fitness is earned, not gifted."

"Listen to your body; it knows best."

"Good health is true wealth."

"Nourish your body, respect your life."

"Healthy choices are acts of self-respect."

"Movement is medicine."

    // Add more of your 70 quotes here...
];

// --- 1. CORE FUNCTIONALITY ---

function toggleManual() {
    isManualMode = !isManualMode;
    document.getElementById('apiFields').style.display = isManualMode ? 'none' : 'flex';
    document.getElementById('manualFields').style.display = isManualMode ? 'flex' : 'none';
    document.getElementById('manualToggle').innerText = isManualMode ? "Search Mode" : "Manual Mode";
}

async function handleAdd() {
    if (isManualMode) {
        const name = document.getElementById('manualName').value;
        const kcal = parseFloat(document.getElementById('manualKcal').value);
        if (!name || isNaN(kcal)) return alert("Please enter both name and calories.");
        addItemToLog(name, kcal, "Manual");
        document.getElementById('manualName').value = "";
        document.getElementById('manualKcal').value = "";
    } else {
        const query = document.getElementById('foodSearch').value;
        const grams = parseFloat(document.getElementById('quantity').value);
        if (!query || isNaN(grams)) return alert("Enter food name and grams!");
        await searchFood(query, grams);
    }
}

async function searchFood(query, grams) {
    const btn = document.getElementById('addBtn');
    btn.innerText = "Searching...";
    try {
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=5&api_key=${API_KEY}`);
        const data = await response.json();
        if (data.foods && data.foods.length > 0) {
            // Find the best match
            const food = data.foods[0];
            const nutrient = food.foodNutrients.find(n => n.unitName === 'KCAL' || n.nutrientId === 1008);
            const calsPer100g = nutrient ? nutrient.value : 0;
            const finalCals = (calsPer100g * grams) / 100;
            
            addItemToLog(food.description, finalCals, grams + "g");
            document.getElementById('foodSearch').value = "";
        } else {
            alert("Food not found in database. Use Manual Mode!");
        }
    } catch (e) {
        alert("Connection Error. Please check your API key.");
    } finally {
        btn.innerText = "Add to Log";
    }
}

function addItemToLog(name, kcal, detail) {
    totalConsumed += kcal;
    
    // Clean name: Removes "raw", "fresh", etc.
    let cleanName = name.replace(/, raw|raw|, fresh|fresh|, dried/gi, "").trim();
    
    const log = document.getElementById('foodLog');
    const li = document.createElement('li');
    li.dataset.kcal = kcal;
    li.innerHTML = `
        <div class="item-info">
            <strong>${cleanName}</strong>
            <small>${detail}</small>
        </div>
        <div>
            <strong>${Math.round(kcal)} kcal</strong>
            <button class="remove-btn" onclick="removeEntry(this)">X</button>
        </div>
    `;
    log.prepend(li);
    updateDisplay();
    saveData();
}

function removeEntry(btn) {
    const li = btn.closest('li');
    totalConsumed -= parseFloat(li.dataset.kcal);
    li.remove();
    updateDisplay();
    saveData();
}

function updateDisplay() {
    const limit = parseFloat(document.getElementById('dailyLimit').value) || 1500;
    const remaining = limit - totalConsumed;
    
    document.getElementById('consumed').innerText = Math.round(totalConsumed);
    document.getElementById('remaining').innerText = Math.round(remaining);
    
    const percent = Math.min((totalConsumed / limit) * 100, 100);
    const bar = document.getElementById('progressBar');
    bar.style.width = percent + "%";
    
    // Change bar color if over limit
    bar.style.backgroundColor = totalConsumed > limit ? "#e74c3c" : "#27ae60";
}

// --- 2. SUMMARY & AI COACH ---

function showSummary() {
    const limit = parseFloat(document.getElementById('dailyLimit').value) || 1500;
    const modal = document.getElementById('summaryModal');
    const statsDiv = document.getElementById('summaryStats');
    const listDiv = document.getElementById('summaryList');
    
    let color = totalConsumed > limit ? "#e74c3c" : "#27ae60";

    statsDiv.innerHTML = `
        <h1 style="color: ${color}; margin: 10px 0;">${Math.round(totalConsumed)} kcal</h1>
        <p>Goal: ${limit} kcal | Status: ${totalConsumed > limit ? 'Over Limit' : 'On Track'}</p>
    `;

    // Build the list for the summary
    let listHtml = "";
    const logItems = document.querySelectorAll('#foodLog li');
    logItems.forEach(item => {
        const name = item.querySelector('strong').innerText;
        const kcal = item.querySelector('div:last-child strong').innerText;
        listHtml += `<div class="summary-row"><span>${name}</span><span>${kcal}</span></div>`;
    });
    
    listDiv.innerHTML = listHtml || "<p style='text-align:center; color:gray;'>No items logged yet.</p>";
    modal.style.display = 'flex';
}

function closeSummary() {
    document.getElementById('summaryModal').style.display = 'none';
    document.getElementById('aiAdviceDisplay').style.display = 'none';
    document.getElementById('aiAdviceDisplay').innerText = "";
}

async function getAIAdvice() {
    const adviceDiv = document.getElementById('aiAdviceDisplay');
    const btn = document.getElementById('aiCoachBtn');
    
    // Gather all text from current log
    const logItems = Array.from(document.querySelectorAll('#foodLog li'))
                          .map(li => li.innerText.replace('X', '').trim()).join(", ");
    const limit = document.getElementById('dailyLimit').value;

    if (!logItems) return alert("Log some food first!");

    btn.innerText = "Coach is thinking...";
    btn.disabled = true;
    adviceDiv.style.display = "block";
    adviceDiv.innerText = "Connecting to Gemini AI...";

    try {
        const response = await fetch('/.netlify/functions/get-ai-advice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                log: logItems,
                total: Math.round(totalConsumed),
                limit: limit
            })
        });
        
        const data = await response.json();
        
        if (data.advice) {
            adviceDiv.innerText = data.advice;
        } else {
            adviceDiv.innerText = "The coach is a bit confused. Try again in a moment.";
        }
    } catch (err) {
        adviceDiv.innerText = "Error: Could not reach the AI Coach.";
    } finally {
        btn.innerText = "Ask AI Coach ✨";
        btn.disabled = false;
    }
}

// --- 3. DATA PERSISTENCE ---

function clearAll() {
    if(confirm("Are you sure you want to clear everything for today?")) {
        totalConsumed = 0;
        document.getElementById('foodLog').innerHTML = "";
        updateDisplay();
        localStorage.removeItem('swasthaData');
    }
}

function saveData() {
    const data = {
        total: totalConsumed,
        logHtml: document.getElementById('foodLog').innerHTML,
        limit: document.getElementById('dailyLimit').value
    };
    localStorage.setItem('swasthaData', JSON.stringify(data));
}

window.onload = () => {
    // Load saved data
    const saved = JSON.parse(localStorage.getItem('swasthaData'));
    if (saved) {
        totalConsumed = saved.total || 0;
        document.getElementById('foodLog').innerHTML = saved.logHtml || "";
        document.getElementById('dailyLimit').value = saved.limit || 1500;
        updateDisplay();
    }
    
    // Pick random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('dailyQuote').innerText = randomQuote;
};
