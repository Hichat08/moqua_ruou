/* DATA */
const cups = [1, 2];
const results = ["drink", "drink", "drink", "pass"];

const drinkers = [
  "👇 BẠN UỐNG!",
  "👈 Người bên trái uống!",
  "👉 Người bên phải uống!",
  "🧑‍🤝‍🧑 Người đối diện uống!",
  "🍻 Cả bàn cùng uống!",
  "🔥 Không trốn được, uống thôi!",
  "💥 Ai né được chén này? Không ai!",
  "😈 Uống đi, đừng ngại!",
  "👊 Đã rót là phải uống!",
  "🍺 Uống tẹt không lùi!",
];

const passTexts = [
  "🎉 QUA LƯỢT – Thoát nạn!",
  "😏 Né được chén này!",
  "🤣 Nhân phẩm cao!",
  "🧧 Lộc né rượu!",
  "🙈 Trót may mắn lần này thôi nhé!",
  "😅 Qua được rồi nhưng đừng quá tự tin!",
  "😜 Cầu may thôi chứ lần sau chưa chắc!",
];

// Thêm nhiều câu cà khịa khi phải uống
const drinkTaunts = [
  "🍻 Không có chỗ trốn, uống thôi!",
  "😤 Uống đi cho máu!",
  "🥴 Hết hàng rào, nhận chén đi!",
  "😏 Thích né thì né lần sau!",
  "🎯 Trúng ngay: uống gấp!",
  "🫠 Không xin được khoan nhượng đâu!",
];

const popup = document.getElementById("popup");
const tauntText = document.getElementById("tauntText");
const cupText = document.getElementById("cupText");
const timerText = document.getElementById("timerText");
const skipBtn = document.getElementById("skipBtn");
const playerNameInput = document.getElementById("playerName");
const nameListEl = document.getElementById("nameList");
const bgm = document.getElementById("bgm");

let bgmStarted = false;
function startBgm() {
  if (!bgm || bgmStarted) return;
  bgmStarted = true;
  const maybePromise = bgm.play();
  if (maybePromise && typeof maybePromise.catch === "function") {
    maybePromise.catch(() => {
      bgmStarted = false;
    });
  }
}

// Auto unmute and play when page loads
window.addEventListener("load", () => {
  if (bgm) {
    bgm.muted = false;
    bgm.play().catch(() => {
      // Play failed, will play on user interaction
    });
  }
});

document.addEventListener("pointerdown", startBgm, { once: true });
document.addEventListener("keydown", startBgm, { once: true });

/* ===== CHỐNG LỆCH LUẬT – BIẾN NHỚ LƯỢT ===== */
let lastResult = null;
let lastCup = null;
let lastDrinker = null;
// (Không sử dụng biến đếm nữa — mọi thứ sẽ ngẫu nhiên và công bằng)

/* ===== HÊN LẮM RA 2: GIẢM TẦN SUẤT ===== */
// Giảm tần suất ngẫu nhiên ra 2 chén để vui hơn
const luckyRate = 1 / 60;

/* ===== TRẠNG THÁI LƯỢT HIỆN TẠI ===== */
let currentBaseCup = 0;
let currentMultiplier = 1;
let currentDrinker = "";
let skipUsed = false;
let countdownId = null;
const playerNames = [];

function renderNameList() {
  if (!nameListEl) return;
  nameListEl.innerHTML = "";
  playerNames.forEach((n, idx) => {
    const chip = document.createElement("div");
    chip.className = "name-chip";
    chip.innerHTML = `
      <span>${n}</span>
      <button onclick="removePlayer(${idx})">X</button>
    `;
    nameListEl.appendChild(chip);
  });
}

function addPlayer() {
  if (!playerNameInput) return;
  const name = playerNameInput.value.trim();
  if (!name) return;
  playerNames.push(name);
  playerNameInput.value = "";
  renderNameList();
}

function removePlayer(index) {
  if (index < 0 || index >= playerNames.length) return;
  playerNames.splice(index, 1);
  renderNameList();
}

if (playerNameInput) {
  playerNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addPlayer();
  });
}

function getPlayerName() {
  if (playerNames.length === 0) return "";
  return playerNames[Math.floor(Math.random() * playerNames.length)];
}

function personalizeDrinker(text) {
  const name = getPlayerName();
  if (!name) return text;
  if (text.startsWith("👇")) return `👇 ${name} uống!`;
  if (text.startsWith("👈")) return `👈 Người bên trái của ${name} uống!`;
  if (text.startsWith("👉")) return `👉 Người bên phải của ${name} uống!`;
  if (text.startsWith("🧑‍🤝‍🧑")) return `🧑‍🤝‍🧑 Người đối diện của ${name} uống!`;
  if (text.startsWith("🍻")) return `🍻 Cả bàn cùng uống với ${name}!`;
  return text;
}

function rollResult() {
  if (Math.random() < luckyRate) {
    return "double"; // Hên lắm ra 2
  }
  return results[Math.floor(Math.random() * results.length)];
}

function setSkipVisible(show) {
  if (!skipBtn) return;
  skipBtn.style.display = show ? "inline-block" : "none";
  skipBtn.disabled = false;
  skipBtn.textContent = "BỎ QUA?";
}

function setStatus(isDrink) {
  if (!tauntText || !cupText) return;
  tauntText.classList.toggle("safe", !isDrink);
  tauntText.classList.toggle("danger", isDrink);
  cupText.classList.toggle("safe", !isDrink);
  cupText.classList.toggle("danger", isDrink);
}

function openGift() {
  startBgm();
  let result, cup, drinker;
  skipUsed = false;

  /* CHỐNG QUA LƯỢT LIÊN TIẾP */
  // Mọi kết quả giờ hoàn toàn ngẫu nhiên — chỉ dùng rollResult()
  do {
    result = rollResult();
  } while (result === "pass" && lastResult === "pass");

  const taunt = "";

  if (result === "pass") {
    const pass = passTexts[Math.floor(Math.random() * passTexts.length)];
    tauntText.innerHTML = `${taunt}<br><span class="emph-soft">${pass}</span>`;
    cupText.textContent = "❌ KHÔNG UỐNG";
    setStatus(false);
    setSkipVisible(false);

    lastResult = "pass";
  } else {
    /* CHỐNG 3 CHÉN LIÊN TIẾP */
    do {
      cup = cups[Math.floor(Math.random() * cups.length)];
    } while (cup === 2 && lastCup === 2);

    /* CHỐNG CÙNG NGƯỜI UỐNG LIÊN TỤC */
    do {
      drinker = drinkers[Math.floor(Math.random() * drinkers.length)];
    } while (drinker === lastDrinker);

    const isAllTable = drinker.includes("Cả bàn");
    if (isAllTable && cup === 2) {
      cup = 1; // nếu ra cả bàn thì 2 thành 1 chén
    }

    currentBaseCup = cup;
    currentMultiplier = result === "double" ? 2 : 1;
    currentDrinker = personalizeDrinker(drinker);

    const totalCup = currentBaseCup * currentMultiplier;

    if (result === "double") {
      tauntText.innerHTML = `
                ${taunt}
                <div class="drink-who emph">${currentDrinker}</div>
                🎉 HÊN LẮM! TRÚNG GẤP ĐÔI!
            `;
    } else {
      tauntText.innerHTML = `
                ${taunt}
                <div class="drink-who emph">${currentDrinker}</div>
                🤣 Né luật là bị phạt thêm đó!
            `;
    }

    cupText.textContent = `🍶 ${totalCup} CHÉN`;
    setSkipVisible(true);

    // Hiển thị badge/hình nhỏ khi ra uống
    if (typeof showDrinkBadge === "function") {
      showDrinkBadge(`${totalCup} CHÉN`);
    }

    lastResult = "drink";
    lastCup = currentBaseCup;
    lastDrinker = drinker;
  }

  popup.style.display = "flex";
  paperRain();
  sparkleBurst();

  let time = 10;
  timerText.textContent = `⏳ Đóng sau ${time}s`;
  if (countdownId) {
    clearInterval(countdownId);
  }
  countdownId = setInterval(() => {
    time--;
    timerText.textContent = `⏳ Đóng sau ${time}s`;
    if (time <= 0) {
      clearInterval(countdownId);
      countdownId = null;
      popup.style.display = "none";
    }
  }, 1000);
}

function trySkip() {
  if (skipUsed) return;
  skipUsed = true;
  if (!skipBtn) return;

  const trap = Math.random() < 0.5; // 50/50 an toàn hoặc bẫy

  if (!trap) {
    tauntText.innerHTML = "✅ AN TOÀN – BỎ QUA THÀNH CÔNG";
    cupText.textContent = "❌ KHÔNG UỐNG";
    setStatus(false);
    skipBtn.disabled = true;
    skipBtn.textContent = "ĐÃ BỎ QUA";
    return;
  }

  // Bẫy: cộng +1 chén vào tổng (ví dụ 2 -> 3), và cà khịa mạnh hơn
  const trapTotal = currentBaseCup * currentMultiplier + 1;
  const trapTaunts = [
    "⚠️ XẬP BẪY! Không trốn được!",
    "😈 Đã cố né, giờ thêm chén cho vui!",
    "💥 Cà khịa: Uống thêm chén nữa đi!",
    "🔥 Bắt buộc cộng 1 chén!",
  ];
  const ta = trapTaunts[Math.floor(Math.random() * trapTaunts.length)];
  tauntText.innerHTML = `\n    ${ta}\n    <div class="drink-who emph">${currentDrinker}</div>\n    💥 ${trapTotal} CHÉN!\n  `;
  cupText.textContent = `🍶 ${trapTotal} CHÉN (BẪY)`;
  skipBtn.disabled = true;
  skipBtn.textContent = "ĐÃ XẬP BẪY";
  // Hiển thị badge khi bị bẫy
  if (typeof showDrinkBadge === "function")
    showDrinkBadge(`${trapTotal} CHÉN (BẪY)`);
}

function paperRain() {
  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "paper";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 3 + Math.random() * 3 + "s";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

function sparkleBurst() {
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    const x = 40 + Math.random() * 20;
    const y = 38 + Math.random() * 20;
    s.style.left = x + "vw";
    s.style.top = y + "vh";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

// Hiển thị một badge/hình nhỏ khi ra uống (tạm dùng div với style inline)
function showDrinkBadge(text) {
  const b = document.createElement("div");
  b.className = "drink-badge";
  b.textContent = text;
  // Styles cơ bản để hiển thị đẹp trên mọi project nhỏ
  b.style.position = "fixed";
  b.style.left = "50%";
  b.style.top = "30%";
  b.style.transform = "translateX(-50%)";
  b.style.background = "rgba(0,0,0,0.75)";
  b.style.color = "#fff";
  b.style.padding = "10px 18px";
  b.style.borderRadius = "999px";
  b.style.fontSize = "18px";
  b.style.zIndex = 9999;
  b.style.boxShadow = "0 6px 18px rgba(0,0,0,0.4)";
  b.style.opacity = "0";
  b.style.transition = "opacity 200ms, transform 400ms";
  document.body.appendChild(b);
  // animate in
  requestAnimationFrame(() => {
    b.style.opacity = "1";
    b.style.transform = "translateX(-50%) translateY(-6px)";
  });
  setTimeout(() => {
    b.style.opacity = "0";
    b.style.transform = "translateX(-50%) translateY(-20px)";
    setTimeout(() => b.remove(), 400);
  }, 1400);
}
