// REPLACE with your actual Gemini API Key or use Netlify Environment Variable
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; 
const FOOD_API_KEY = 'nfIy16UWdgJ1bdz60r8skJd5s6oV6IBsoglRYKkh'; 

let totalConsumed = 0;
let isManualMode = false;

const quotes = [
    "Svasthya nai dhana ho. (Health is wealth)",
    "A journey of a thousand miles begins with a single step.",
    "Eat to live, not live to eat.",
    "Your body is a temple, keep it clean and pure.",
    "Consistency is the key to success.",
    "An apple a day keeps the doctor away.",
    "Drink more water; your skin and body will thank you.",
    "Small steps lead to big changes.",
    "Today's choices are tomorrow's results.",
    "Your body is a temple, treat it with respect.",
    "Eating well is a form of self-respect.",
    "Fitness is a journey, not a destination.",
    "Health is not just about what you eat, but what you think and say.",
    "Move your body, free your mind.",
    "Rest is productive too.",
    "Positive thoughts, positive life.",
    "What you do today can improve all your tomorrows.",
    "Fuel your body, feed your soul.",
    "Progress, not perfection.",
    "Strong mind, strong body.",
    "Hustle for health, not just wealth.",
    "Every meal is a chance to nourish yourself.",
    "Your health is your true wealth.",
    "Healthy habits create a healthy life.",
    "Wellness is a daily practice, not a destination.",
    "Take care of your body, it’s the only place you live in.",
    "The best investment is in your own health.",
    "A little exercise each day keeps the doctor away.",
    "Good food, good mood.",
    "Eat clean, feel great.",
    "Mindful eating, mindful living.",
    "Small changes, big impact.",
    "Strength grows in the moments when you think you can’t go on but you keep going.",
    "Happiness is homemade.",
    "The groundwork for all happiness is good health.",
    "Your body deserves the best.",
    "Wellness begins with self-love.",
    "Healthy mind, healthy body.",
    "Nourish to flourish.",
    "You are what you eat, so don’t be fast, cheap, easy, or fake.",
    "A healthy outside starts from the inside.",
    "Make your health a priority.",
    "Consistency beats intensity.",
    "Your energy introduces you before you speak.",
    "Small healthy choices every day lead to big results.",
    "Fitness is not about being better than someone else; it’s about being better than you used to be.",
    "Respect your body. It’s the only one you have.",
    "Health is a relationship between you and your body.",
    "Don’t count calories, make calories count.",
    "Move more, stress less.",
    "You can’t pour from an empty cup. Take care of yourself first.",
    "Invest in yourself. You are worth it.",
    "Healthy living is a form of self-respect.",
    "Eat for the body you want, not the body you have.",
    "Be stronger than your excuses."
];


function setDailyQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('dailyQuote').innerText = quotes[randomIndex];
}

function toggleEntryMode() {
    isManualMode = !isManualMode;
    document.getElementById('searchModeUI').style.display = isManualMode ? 'none' : 'block';
    document.getElementById('manualModeUI').style.display = isManualMode ? 'block' : 'none';
    document.getElementById('modeToggleBtn').innerText = isManualMode ? "Switch to Search Mode" : "Switch to Manual Mode";
}

async function handleAdd() {
    const qty = parseFloat(document.getElementById('quantity').value) || 1;
    const unit = document.getElementById('unitSelector').value;
    const q = document.getElementById('foodSearch').value.toLowerCase().trim();

    // Unit weight mapping for non-piece items
    const unitMap = { "g": 1, "spoon": 15, "muthi": 45, "kachaura": 180, "plate": 350 };
    
    let finalKcal = 0;
    let displayName = q;

    if (isManualMode) {
        const name = document.getElementById('manualName').value;
        const kcal = parseFloat(document.getElementById('manualKcal').value);
        if (name && kcal) addItemToLog(name, kcal, "Manual");
        return;
    }

    // 1. HARD-CODED EGG LOGIC
    if (q === "egg" || q === "whole egg" || q === "boiled egg") {
        finalKcal = qty * 70; // Hard-coded: 70 kcal per whole boiled egg
        displayName = "Whole Boiled Egg";
    } 
    else if (q === "egg white" || q === "boiled egg white") {
        finalKcal = qty * 17; // Hard-coded: 17 kcal per boiled egg white
        displayName = "Boiled Egg White";
    }
    // 2. OTHER NEPALI DEFAULTS
    else {
        const nepaliDefaults = { "rice": 1.3, "dal": 0.7, "tarkari": 0.9, "roti": 100, "momo": 35 };
        
        if (nepaliDefaults[q]) {
            // Roti is treated as "per piece" by default, others by weight
            if (q === "roti" || unit === "piece") {
                finalKcal = qty * nepaliDefaults[q];
            } else {
                finalKcal = (qty * unitMap[unit]) * nepaliDefaults[q];
            }
        } else {
            // 3. API FALLBACK
            const totalGrams = unit === "piece" ? qty * 100 : qty * unitMap[unit];
            searchFoodAPI(q, totalGrams, qty, unit);
            return; // Exit as API handles its own log adding
        }
    }

    addItemToLog(displayName, finalKcal, `${qty} ${unit}`);
}

async function searchFoodAPI(q, g, qty, u) {
    try {
        const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${q}&pageSize=1&api_key=${FOOD_API_KEY}`);
        const data = await res.json();
        const kcal = (data.foods[0].foodNutrients.find(n => n.unitName === 'KCAL').value / 100) * g;
        addItemToLog(data.foods[0].description, kcal, `${qty} ${u}`);
    } catch(e) { alert("Try Manual Mode for this specific item."); }
}

function addItemToLog(name, kcal, detail) {
    totalConsumed += kcal;
    const logId = Date.now(); // Unique ID for each entry
    
    const li = document.createElement('li');
    li.setAttribute('data-id', logId);
    li.setAttribute('data-kcal', kcal);
    
    li.innerHTML = `
        <div class="log-info">
            <span>${name} (${detail})</span>
            <strong>${Math.round(kcal)} kcal</strong>
        </div>
        <button class="delete-item-btn" onclick="deleteItem(${logId})">×</button>
    `;
    
    document.getElementById('foodLog').prepend(li);
    updateDisplay();
}

function deleteItem(id) {
    const item = document.querySelector(`li[data-id="${id}"]`);
    if (item) {
        const kcal = parseFloat(item.getAttribute('data-kcal'));
        totalConsumed -= kcal;
        item.remove();
        updateDisplay();
    }
}

function updateDisplay() {
    const lim = parseFloat(document.getElementById('dailyLimit').value) || 1500;
    const remaining = Math.max(0, Math.round(lim - totalConsumed));
    const percent = (totalConsumed / lim) * 100;

    document.getElementById('consumed').innerText = Math.round(totalConsumed);
    document.getElementById('remaining').innerText = remaining;
    
    const bar = document.getElementById('progressBar');
    bar.style.width = Math.min(percent, 100) + "%";

    // Dynamic Color Logic
    bar.classList.remove('low', 'mid', 'high', 'over');
    if (percent > 100) {
        bar.classList.add('over'); // Red (Exceeded)
    } else if (percent > 85) {
        bar.classList.add('high'); // Orange/Warm Red (Almost there)
    } else if (percent > 50) {
        bar.classList.add('mid');  // Yellow (Halfway)
    } else {
        bar.classList.add('low');  // Green (Safe)
    }
}

// RESTORED GEMINI AI FUNCTION
async function getAIReview() {
    const logItems = Array.from(document.querySelectorAll('#foodLog li')).map(li => li.innerText).join(", ");
    const output = document.getElementById('summaryOutput');
    const limit = document.getElementById('dailyLimit').value;
    const consumed = Math.round(totalConsumed);

    if (!logItems) {
        output.innerText = "Please add food items first.";
        return;
    }

    output.innerText = "Gemini is analyzing your day...";

    const prompt = `Act as a professional nutritionist. My goal is ${limit} kcal, I ate ${consumed} kcal. Items: ${logItems}. Provide a 3-sentence summary of nutritional balance and one specific improvement for tomorrow. Keep it encouraging.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        output.innerHTML = `<strong>Gemini Insight:</strong><br>${data.candidates[0].content.parts[0].text}`;
    } catch (e) {
        output.innerText = "Gemini is currently resting. Please check your API key.";
    }
}

function calculateAdvanced() {
    const w = document.getElementById('currentWeight').value;
    const h = document.getElementById('heightcm').value;
    const a = document.getElementById('age').value;
    const act = document.getElementById('activity').value;
    if(w && h && a) {
        const target = Math.round(((10 * w) + (6.25 * h) - (5 * a) + 5) * act - 500);
        document.getElementById('dailyLimit').value = target;
        updateDisplay();
    }
}

function predictWeightLoss() {
    const def = document.getElementById('deficitInput').value;
    const out = document.getElementById('predictionOutput');
    if(def) out.innerText = "Est. Monthly Loss: " + ((def * 30)/7700).toFixed(2) + " kg";
}

function openSummaryModal() {
    document.getElementById('cardLimit').innerText = document.getElementById('dailyLimit').value;
    document.getElementById('cardConsumed').innerText = Math.round(totalConsumed);
    
    // Clear and rebuild the Food Strip as Tags
    const strip = document.getElementById('cardLogList');
    strip.innerHTML = "";
    
    const items = Array.from(document.querySelectorAll('#foodLog li'));
    
    if (items.length === 0) {
        strip.innerHTML = "<p style='color:#ccc; font-size:0.8rem;'>No items logged today.</p>";
    } else {
        items.forEach(li => {
            const tagName = li.querySelector('span').innerText;
            const tag = document.createElement('div');
            tag.className = 'food-tag';
            tag.innerText = tagName;
            strip.appendChild(tag);
        });
    }

    // Reset AI text to your custom instruction
    document.getElementById('summaryOutput').innerHTML = 
        `Please click on <strong>Get Gemini Review</strong> for suggestions on what to eat.`;
    
    document.getElementById('summaryModal').style.display = "block";
}

function closeSummaryModal() { document.getElementById('summaryModal').style.display = "none"; }

function downloadAsImage() {
    html2canvas(document.getElementById('reportCard')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'SwasthaSukha_Report.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function clearAll() { totalConsumed = 0; document.getElementById('foodLog').innerHTML = ""; updateDisplay(); }

window.onload = updateDisplay;

// Change daily quote every 10 seconds
setInterval(setDailyQuote, 10000);

// Set a random quote on page load
setDailyQuote();
