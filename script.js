const API_KEY = 'nfIy16UWdgJ1bdz60r8skJd5s6oV6IBsoglRYKkh';
let totalConsumed = 0;
let isManualMode = false;

const quotes = [
    "Health is wealth.",
    "Small steps every day.",
    "Eat to live, don't live to eat.",
    "Your body is a temple."
];

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
        if (!name || isNaN(kcal)) return alert("Please enter name and calories.");
        addItemToLog(name, kcal, "Manual");
        document.getElementById('manualName').value = "";
        document.getElementById('manualKcal').value = "";
    } else {
        const query = document.getElementById('foodSearch').value;
        const grams = parseFloat(document.getElementById('quantity').value);
        if (!query || isNaN(grams)) return alert("Enter food name and weight!");
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
            const food = data.foods[0];
            const nutrient = food.foodNutrients.find(n => n.unitName === 'KCAL' || n.nutrientId === 1008);
            const calsPer100g = nutrient ? nutrient.value : 0;
            const finalCals = (calsPer100g * grams) / 100;
            addItemToLog(food.description, finalCals, grams + "g");
            document.getElementById('foodSearch').value = "";
        } else {
            alert("Food not found.");
        }
    } catch (e) {
        alert("API Error. Try Manual Mode.");
    }
    btn.innerText = "Add to Log";
}

function addItemToLog(name, kcal, detail) {
    totalConsumed += kcal;
    let cleanName = name.replace(/, raw|raw|, fresh/gi, "").trim();
    const log = document.getElementById('foodLog');
    const li = document.createElement('li');
    li.dataset.kcal = kcal;
    li.innerHTML = `<div><strong>${cleanName}</strong> <small>(${detail})</small></div>
                    <div><strong>${Math.round(kcal)}</strong> <button class="remove-btn" onclick="removeEntry(this)">X</button></div>`;
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
    document.getElementById('consumed').innerText = Math.round(totalConsumed);
    document.getElementById('remaining').innerText = Math.round(limit - totalConsumed);
    const percent = Math.min((totalConsumed / limit) * 100, 100);
    const bar = document.getElementById('progressBar');
    bar.style.width = percent + "%";
    bar.style.backgroundColor = totalConsumed > limit ? "#e74c3c" : "#27ae60";
}

function showSummary() {
    const limit = parseFloat(document.getElementById('dailyLimit').value) || 1500;
    const modal = document.getElementById('summaryModal');
    const statsDiv = document.getElementById('summaryStats');
    const listDiv = document.getElementById('summaryList');
    
    statsDiv.innerHTML = `<h1 style="color:${totalConsumed > limit ? '#e74c3c' : '#27ae60'}">${Math.round(totalConsumed)} kcal</h1><p>Goal: ${limit}</p>`;
    
    let listHtml = "";
    document.querySelectorAll('#foodLog li').forEach(item => {
        const name = item.querySelector('strong').innerText;
        const cals = item.querySelector('div:last-child strong').innerText;
        listHtml += `<div class="summary-row"><span>${name}</span><span>${cals} kcal</span></div>`;
    });
    listDiv.innerHTML = listHtml || "No items logged.";
    modal.style.display = 'flex';
}

function closeSummary() { document.getElementById('summaryModal').style.display = 'none'; }

function clearAll() {
    if(confirm("Clear today's log?")) {
        totalConsumed = 0;
        document.getElementById('foodLog').innerHTML = "";
        updateDisplay();
        localStorage.removeItem('swasthaLog');
    }
}

function saveData() {
    const data = {
        total: totalConsumed,
        log: document.getElementById('foodLog').innerHTML,
        limit: document.getElementById('dailyLimit').value
    };
    localStorage.setItem('swasthaLog', JSON.stringify(data));
}

window.onload = () => {
    const saved = JSON.parse(localStorage.getItem('swasthaLog'));
    if (saved) {
        totalConsumed = saved.total || 0;
        document.getElementById('foodLog').innerHTML = saved.log || "";
        document.getElementById('dailyLimit').value = saved.limit || 1500;
        updateDisplay();
    }
    document.getElementById('dailyQuote').innerText = quotes[Math.floor(Math.random() * quotes.length)];
};
