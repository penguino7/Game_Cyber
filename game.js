// 1. TRẠNG THÁI GAME
let gameState = {
  teamScores: [0, 0, 0, 0],
  answered: [],
  currentCell: null,
  cellTypes: [],
  currentSpecialType: null,
  currentTeam: null,
  teamsAnsweredThisRound: [],
};

// 2. KHỞI TẠO Ô ĐẶC BIỆT
function initializeCellTypes() {
  const distribution = [
    ...Array(16).fill("normal"),
    ...Array(8).fill("double"),
    ...Array(5).fill("lose"),
    ...Array(5).fill("random"),
    ...Array(2).fill("skip"),
  ];
  gameState.cellTypes = distribution.sort(() => Math.random() - 0.5);
}

// 3. RENDER SCOREBOARD
function renderScoreBoard() {
  const container = document.getElementById("score-container");
  if (!container) return;
  const fragment = document.createDocumentFragment();
  teams.forEach((team, i) => {
    const div = document.createElement("div");
    div.className = `bg-gradient-to-r ${team.color} rounded-2xl px-2 py-3 shadow-lg text-white transform-gpu`;
    div.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="text-xl">${team.icon}</span>
                <span class="text-[10px] font-black uppercase opacity-70">${team.name.split(" ")[1]}</span>
            </div>
            <p id="score-team-${i}" class="text-2xl font-black text-center">${gameState.teamScores[i]}</p>
        `;
    fragment.appendChild(div);
  });
  container.innerHTML = "";
  container.appendChild(fragment);
}

// 4. TẠO LƯỚI 36 Ô
function createGameGrid() {
  const grid = document.getElementById("game-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 36; i++) {
    const isAnswered = gameState.answered.includes(i);
    const cell = document.createElement("button");
    cell.id = `cell-${i}`;
    let bgClass = isAnswered
      ? "bg-slate-700 opacity-30 cursor-not-allowed"
      : "bg-gradient-to-br from-cyan-500 to-teal-600";
    if (i === 0 && !isAnswered)
      bgClass =
        "bg-gradient-to-br from-yellow-500 to-orange-600 ring-2 ring-yellow-300 animate-pulse";

    cell.className = `cell-btn aspect-square rounded-xl font-bold text-white shadow-lg transition-all ${bgClass}`;
    cell.innerHTML = isAnswered ? "✓" : i === 0 ? "★" : i + 1;
    cell.disabled = isAnswered;
    if (!isAnswered) cell.onclick = () => handleCellClick(i);
    fragment.appendChild(cell);
  }
  grid.appendChild(fragment);
}

// 5. XỬ LÝ CHỌN Ô
function handleCellClick(index) {
  gameState.currentCell = index;
  gameState.currentSpecialType = specialTypes.find(
    (t) => t.type === gameState.cellTypes[index],
  );
  document.getElementById("modal-cell-info").textContent =
    index === 0 ? "⚡ THỬ THÁCH ĐẶC BIỆT ⚡" : `THỬ THÁCH SỐ ${index + 1}`;

  const teamOptions = document.getElementById("team-options");
  teamOptions.innerHTML = teams
    .map((team, i) => {
      const hasPlayed = gameState.teamsAnsweredThisRound.includes(i);
      return `
            <button onclick="${hasPlayed ? "" : `selectTeam(${i})`}" 
                class="bg-gradient-to-r ${team.color} p-4 rounded-2xl text-white font-bold transition-all shadow-lg 
                ${hasPlayed ? "opacity-20 cursor-not-allowed grayscale" : "hover:scale-105 active:scale-95"}"
                ${hasPlayed ? "disabled" : ""}>
                <div class="text-3xl mb-1">${hasPlayed ? "🚫" : team.icon}</div>
                <div class="text-xs uppercase tracking-widest">${team.name}</div>
            </button>`;
    })
    .join("");
  showModal("team-modal");
}

// 6. CHỌN ĐỘI & RESET LƯỢT (FIXED)
function selectTeam(teamIdx) {
  gameState.currentTeam = teamIdx;
  if (!gameState.teamsAnsweredThisRound.includes(teamIdx)) {
    gameState.teamsAnsweredThisRound.push(teamIdx);
  }
  closeModal("team-modal");

  const spec = gameState.currentSpecialType;
  document.getElementById("intro-icon").textContent = spec.icon;
  document.getElementById("intro-name").textContent = spec.name;
  document.getElementById("intro-desc").textContent = spec.description;

  showModal("special-intro-modal");

  setTimeout(() => {
    closeModal("special-intro-modal");
    // FIX: Đảm bảo luồng chạy câu hỏi không bị kẹt
    if (
      gameState.currentCell === 0 &&
      typeof startMatchingGame === "function"
    ) {
      startMatchingGame((isWin) => handleMinigameResult(isWin));
    } else {
      setupQuestion();
    }
  }, 1800);
}

// 7. HIỂN THỊ CÂU HỎI (FIXED)
function setupQuestion() {
  const q = vocabularyData[gameState.currentCell];
  if (!q) return;

  document.getElementById("special-tag").innerHTML = `
        <div class="flex flex-col items-center bg-gradient-to-r ${gameState.currentSpecialType.color} text-white px-8 py-3 rounded-2xl animate-bounce border-4 border-white">
            <span class="text-3xl">${gameState.currentSpecialType.icon}</span>
            <span class="text-sm font-black uppercase tracking-widest">${gameState.currentSpecialType.name}</span>
        </div>`;

  document.getElementById("question-word").textContent = q.word;
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  document.getElementById("options-container").innerHTML = shuffledOptions
    .map(
      (opt) => `
        <button onclick="checkAnswer('${opt}', '${q.correct}')" 
            class="group w-full p-6 rounded-2xl font-black text-left bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 transition-all shadow-lg text-white">
            <span>${opt}</span>
        </button>`,
    )
    .join("");

  showModal("question-modal");
}

// 8. KIỂM TRA KẾT THÚC VÒNG (FIXED)
function checkRoundEnd() {
  if (gameState.teamsAnsweredThisRound.length === 4) {
    gameState.teamsAnsweredThisRound = []; // Reset lượt chơi
    updateLeaderboard(true);
  } else {
    updateLeaderboard(false);
  }
}

// 9. LOGIC NHẠC KHÔNG DELAY (FIXED)
const bgMusic = document.getElementById("bg-music");
const playIcon = document.getElementById("play-icon");
const musicWaves = document.getElementById("music-waves");
let isMusicPlaying = false;

// Dùng sự kiện input để thay đổi âm lượng tức thì
document.getElementById("volume-slider").oninput = (e) => {
  bgMusic.volume = e.target.value;
  document.getElementById("volume-value").textContent =
    Math.round(e.target.value * 100) + "%";
};

document.getElementById("music-toggle").onclick = () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    playIcon.textContent = "▶";
    musicWaves.classList.add("opacity-0");
  } else {
    bgMusic.play().catch((e) => console.log("User interaction required"));
    playIcon.textContent = "⏸";
    musicWaves.classList.remove("opacity-0");
  }
  isMusicPlaying = !isMusicPlaying;
};

// CẬP NHẬT UI NHẮM MỤC TIÊU (FIXED LAG)
function updateUI() {
  gameState.teamScores.forEach((score, i) => {
    const el = document.getElementById(`score-team-${i}`);
    if (el) el.textContent = score;
  });
  document.getElementById("progress").textContent =
    `${gameState.answered.length}/36`;
  if (gameState.currentCell !== null) {
    const cell = document.getElementById(`cell-${gameState.currentCell}`);
    if (cell) {
      cell.disabled = true;
      cell.innerHTML = "✓";
      cell.className =
        "cell-btn aspect-square rounded-xl font-bold text-white bg-slate-700 opacity-30 cursor-not-allowed";
    }
  }
}

// UI HELPERS
function showModal(id) {
  document.getElementById(id).classList.remove("hidden");
  document.getElementById(id).classList.add("flex");
}
function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  document.getElementById(id).classList.remove("flex");
}

// KHỞI ĐỘNG
document.getElementById("start-btn").onclick = () => {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  initializeCellTypes();
  renderScoreBoard();
  createGameGrid();
  updateLeaderboard(false);
  bgMusic
    .play()
    .then(() => {
      isMusicPlaying = true;
      playIcon.textContent = "⏸";
      musicWaves.classList.remove("opacity-0");
    })
    .catch(() => {});
};
