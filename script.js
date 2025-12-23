const API_KEY = 'nfIy16UWdgJ1bdz60r8skJd5s6oV6IBsoglRYKkh';
let totalConsumed = 0;
let isManualMode = false;

const quotes = [
    "A journey of a thousand miles begins with a single step.", "Every meal is a chance to nourish your body.", "Consistency is more important than perfection.", "Your body is your temple.", "Don't count the days, make the days count.", "Small progress is still progress.", "Health is the life you gain.", "Fuel your body, don't just fill it.", "Action is the foundational key to success.", "Discipline is choosing between now and most.", 
    "Focus on the goal, not the obstacle.", "Believe you can and you're halfway there.", "Your health is an investment, not an expense.", "The only bad workout is the one that didn't happen.", "Success starts with self-discipline.", "Be stronger than your excuses.", "Fitness is a lifestyle, not a finish line.", "You are what you eat.", "Eat for the body you want.", "Take care of your body; it's the only place you have to live.",
    "Make yourself a priority.", "Don't stop until you're proud.", "Strive for progress, not perfection.", "Health is wealth.", "A healthy outside starts from the inside.", "You don't have to be great to start.", "One meal won't make you healthy.", "Persistence pays off.", "Mindset is everything.", "You are one workout away from a good mood.",
    "Small changes make a big difference.", "Good things take time.", "Stronger every day.", "Commit to be fit.", "Results happen over time, not overnight.", "Wake up with determination.", "Go the extra mile.", "Life has no shortcut.", "Hard work beats talent.", "The best project you'll ever work on is you.",
    "Be your own hero.", "Every day is a new beginning.", "Do something today your future self will thank you.", "Dream big, work hard.", "Eat clean, stay fit.", "Exercise is a celebration of what your body can do.", "Your only limit is you.", "Keep showing up.", "Train like a beast.", "Don't wish for it, work for it.",
    "No pain, no gain.", "Push yourself.", "Stay hungry for success.", "Think healthy, be healthy.", "Your goals don't care how you feel.", "Sweat is just fat crying.", "Make it happen.", "Motivation gets you started, habit keeps you going.", "Fitness is not a destination.", "Respect your body.",
    "Stay consistent.", "Your body hears everything your mind says.", "Change your habits, change your life.", "Eat well, live well.", "Balance is key.", "Keep it simple.", "The secret of getting ahead is getting started.", "Energy flows where intention goes.", "Start where you are.", "You've got this."
];

// --- APP LOGIC ---

function setRandomQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.innerText = `"${quotes[randomIndex]}"`;
}

function toggleManual() {
    isManualMode = !isManualMode;
    document.getElementById('apiFields').style.display = isManualMode ? 'none' : 'flex';
    document.getElementById('manualFields').style.display = isManualMode ? 'flex' : 'none';
    document.getElementById('manualToggle').innerText = isManualMode ? "Search Mode" : "Manual Mode";
}

// Function that handles the button click
async function handleAdd() {
    if (isManualMode) {
        const name = document.getElementById('manualName').value;
        const kcal = parseFloat(document.getElementById('manualKcal').value);
        if (!name || isNaN(kcal)) return alert("Enter food name and calories!");
        addItemToLog(name, kcal, "Manual");
        document.getElementById('manualName').value = "";
        document.getElementById('manualKcal').value = "";
    } else {
        const query = document.getElementById('foodSearch').value.toLowerCase();
        const grams = parseFloat(document.getElementById('quantity').value);
        if (!query || isNaN(grams)) return alert("Enter food and grams!");
        await searchFood(query, grams);
    }
}

async function searchFood(query, grams) {
    const btn = document.getElementById('addBtn');
    btn.innerText = "Searching...";
    btn.disabled = true;

    try {
        // We ask for 25 results so we have more to pick from
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${query}&pageSize=25&api_key=${API_KEY}`);
        const data = await response.json();
        
        if (data.foods && data.foods.length > 0) {
            // Logic to find the most "natural" version
            // It looks for descriptions that include 'raw' or 'fresh'
            let bestMatch = data.foods.find(f => {
                const desc = f.description.toLowerCase();
                return desc.includes('raw') || desc.includes('fresh');
            }) || data.foods[0]; // Falls back to first result if 'raw' isn't found

            const nutrient = bestMatch.foodNutrients.find(n => n.unitName === 'KCAL' || n.nutrientId === 1008);
            const cals = ((nutrient ? nutrient.value : 0) * grams) / 100;
            
            addItemToLog(bestMatch.description, cals, grams + "g");
            document.getElementById('foodSearch').value = "";
        } else {
            alert("Food not found.");
        }
    } catch (e) {
        alert("API Error.");
    } finally {
        btn.innerText = "Add to Log";
        btn.disabled = false;
    }
}

function addItemToLog(name, kcal, detail) {
    totalConsumed += kcal;
    
    // This line removes the word "raw", "fresh", and extra commas 
    // to make the name look nicer (e.g., "Avocado" instead of "Avocado, raw")
    let cleanName = name.replace(/, raw|raw|, fresh|fresh/gi, "").trim();

    const log = document.getElementById('foodLog');
    const li = document.createElement('li');
    li.dataset.kcal = kcal;
    li.innerHTML = `
        <div class="item-info">
            <strong>${cleanName}</strong>
            <small>${detail}</small>
        </div>
        <div style="display:flex; align-items:center;">
            <strong>${Math.round(kcal)} kcal</strong>
            <button class="remove-btn" style="margin-left:10px" onclick="removeEntry(this)">X</button>
        </div>
    `;
    log.prepend(li);
    updateDisplay();
}

function removeEntry(btn) {
    const li = btn.closest('li');
    totalConsumed -= parseFloat(li.dataset.kcal);
    li.remove();
    updateDisplay();
}

function updateDisplay() {
    const limit = parseFloat(document.getElementById('dailyLimit').value) || 1500;
    const remaining = limit - totalConsumed;
    document.getElementById('consumed').innerText = Math.round(totalConsumed);
    document.getElementById('remaining').innerText = Math.round(remaining);

    const progressBar = document.getElementById('progressBar');
    let percentage = (totalConsumed / limit) * 100;
    progressBar.style.width = Math.min(percentage, 100) + "%";
    
    if (percentage >= 100) progressBar.style.backgroundColor = "#e74c3c";
    else if (percentage >= 80) progressBar.style.backgroundColor = "#f1c40f";
    else progressBar.style.backgroundColor = "#27ae60";

    saveData();
}

function saveData() {
    localStorage.setItem('swastha_limit', document.getElementById('dailyLimit').value);
    localStorage.setItem('swastha_log', document.getElementById('foodLog').innerHTML);
    localStorage.setItem('swastha_total', totalConsumed);
}

function loadData() {
    const savedLimit = localStorage.getItem('swastha_limit');
    if (savedLimit) document.getElementById('dailyLimit').value = savedLimit;

    const savedTotal = localStorage.getItem('swastha_total');
    if (savedTotal) totalConsumed = parseFloat(savedTotal);

    const savedLog = localStorage.getItem('swastha_log');
    if (savedLog) document.getElementById('foodLog').innerHTML = savedLog;

    updateDisplay();
}

function clearAll() {
    if (confirm("Clear today's data?")) {
        totalConsumed = 0;
        document.getElementById('foodLog').innerHTML = "";
        localStorage.clear();
        updateDisplay();
    }
}

// Initial Load
setRandomQuote();
loadData();
