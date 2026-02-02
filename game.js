// 1. TRẠNG THÁI GAME (State Management)
let gameState = {
  teamScores: [0, 0, 0, 0],
  answered: [],
  currentCell: null,
  cellTypes: [],
  currentSpecialType: null,
  currentTeam: null,
  teamsAnsweredThisRound: [],
};

// 2. KHỞI TẠO HỆ THỐNG Ô ĐẶC BIỆT
function initializeCellTypes() {
  const types = ["normal", "double", "lose", "random", "skip"];
  const counts = [16, 8, 5, 5, 2];
  let distribution = [];
  counts.forEach((count, i) => {
    distribution.push(...Array(count).fill(types[i]));
  });
  gameState.cellTypes = distribution.sort(() => Math.random() - 0.5);
}

// 3. RENDER SCOREBOARD (Chỉ chạy 1 lần lúc khởi động)
function renderScoreBoard() {
  const container = document.getElementById("score-container");
  if (!container) return;

  const fragment = document.createDocumentFragment();
  teams.forEach((team, i) => {
    const div = document.createElement("div");
    div.className = `bg-gradient-to-r ${team.color} rounded-2xl px-2 py-3 shadow-lg text-white transform-gpu`; // Dùng GPU
    div.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <span class="text-xl">${team.icon}</span>
                <span class="text-[10px] font-black uppercase opacity-70">${team.name.split(" ")[1]}</span>
            </div>
            <p id="score-team-${i}" class="text-2xl font-black text-center tabular-nums">${gameState.teamScores[i]}</p>
        `;
    fragment.appendChild(div);
  });
  container.innerHTML = "";
  container.appendChild(fragment);
}

// 4. TẠO LƯỚI GAME (Tối ưu Reflow)
function createGameGrid() {
  const grid = document.getElementById("game-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 36; i++) {
    const cell = document.createElement("button");
    cell.id = `cell-${i}`;
    const isAnswered = gameState.answered.includes(i);

    // Thiết lập Style ban đầu
    let bgClass = isAnswered
      ? "bg-slate-700 opacity-30 cursor-not-allowed"
      : "bg-gradient-to-br from-cyan-500 to-teal-600";

    if (i === 0 && !isAnswered) {
      bgClass =
        "bg-gradient-to-br from-yellow-500 to-orange-600 ring-2 ring-yellow-300 animate-pulse";
    }

    cell.className = `cell-btn aspect-square rounded-xl font-bold text-white shadow-lg transition-transform duration-200 will-change-transform ${bgClass}`;
    cell.innerHTML = isAnswered ? "✓" : i === 0 ? "★" : i + 1;
    cell.disabled = isAnswered;

    if (!isAnswered) {
      cell.onclick = () => handleCellClick(i);
    }
    fragment.appendChild(cell);
  }
  grid.appendChild(fragment);
}

// 5. XỬ LÝ CLICK Ô
function handleCellClick(index) {
  gameState.currentCell = index;
  gameState.currentSpecialType = specialTypes.find(
    (t) => t.type === gameState.cellTypes[index],
  );

  const modalTitle = document.getElementById("modal-cell-info");
  modalTitle.textContent =
    index === 0 ? "⚡ THỬ THÁCH ĐẶC BIỆT ⚡" : `THỬ THÁCH SỐ ${index + 1}`;

  const teamOptions = document.getElementById("team-options");
  teamOptions.innerHTML = teams
    .map((team, i) => {
      const hasPlayed = gameState.teamsAnsweredThisRound.includes(i);
      return `
            <button onclick="${hasPlayed ? "" : `selectTeam(${i})`}" 
                class="bg-gradient-to-r ${team.color} p-4 rounded-2xl text-white font-bold transition-all shadow-lg transform-gpu
                ${hasPlayed ? "opacity-20 cursor-not-allowed grayscale" : "hover:scale-105 active:scale-95"}"
                ${hasPlayed ? "disabled" : ""}>
                <div class="text-3xl mb-1">${hasPlayed ? "🚫" : team.icon}</div>
                <div class="text-xs uppercase tracking-widest">${team.name}</div>
            </button>`;
    })
    .join("");

  showModal("team-modal");
}

// 6. CHỌN ĐỘI & HIỆN INTRO
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
    // Kiểm tra xem có phải ô Mini-game (Ô số 1) không
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

// 7. XỬ LÝ CÂU HỎI TRẮC NGHIỆM
function setupQuestion() {
  const q = vocabularyData[gameState.currentCell];
  const spec = gameState.currentSpecialType;

  document.getElementById("special-tag").innerHTML = `
        <div class="flex flex-col items-center bg-gradient-to-r ${spec.color} text-white px-8 py-3 rounded-[2rem] shadow-2xl animate-bounce border-4 border-white transform-gpu">
            <span class="text-3xl">${spec.icon}</span>
            <span class="text-sm font-black uppercase tracking-widest">${spec.name}</span>
        </div>`;

  document.getElementById("question-word").textContent = q.word;
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  document.getElementById("options-container").innerHTML = shuffledOptions
    .map(
      (opt) => `
        <button onclick="checkAnswer('${opt}', '${q.correct}')" 
            class="group w-full p-6 rounded-[2rem] font-black text-left bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 transition-all flex justify-between items-center shadow-lg transform-gpu hover:bg-slate-700">
            <span class="text-white group-hover:text-cyan-300 text-xl">${opt}</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">⚡</span>
        </button>`,
    )
    .join("");

  showModal("question-modal");
}

// 8. KIỂM TRA ĐÁP ÁN (Check & Point Logic)
function checkAnswer(selected, correct) {
  const teamIdx = gameState.currentTeam;
  const spec = gameState.currentSpecialType.type;
  let points = 0;
  const isCorrect = selected === correct;

  if (isCorrect) {
    points = 10;
    if (spec === "double") points = 20;
    if (spec === "lose") points = -5;
    if (spec === "random") points = Math.floor(Math.random() * 16) + 5;
    if (spec === "skip") points = 0;
  }

  gameState.teamScores[teamIdx] += points;
  gameState.answered.push(gameState.currentCell);

  closeModal("question-modal");
  showResultModal(isCorrect, points, correct, teams[teamIdx]);
  checkRoundEnd();
}

// 9. MINI-GAME RESULT
function handleMinigameResult(isSuccess) {
  const teamIdx = gameState.currentTeam;
  const spec = gameState.currentSpecialType.type;
  let points = isSuccess ? 20 : 0;

  if (isSuccess && spec === "double") points *= 2;
  // ... Thêm logic ô đặc biệt cho minigame nếu cần

  gameState.teamScores[teamIdx] += points;
  gameState.answered.push(gameState.currentCell);

  showResultModal(isSuccess, points, "N/A", teams[teamIdx]);
  checkRoundEnd();
}

// 10. KẾT THÚC VÒNG & LEADERBOARD
function checkRoundEnd() {
  const isRoundEnd = gameState.teamsAnsweredThisRound.length === 4;
  if (isRoundEnd) gameState.teamsAnsweredThisRound = [];
  updateLeaderboard(isRoundEnd);
}

function updateLeaderboard(isRoundEnd) {
  const listContainer = document.getElementById("leaderboard-list");
  const rankings = teams
    .map((team, index) => ({
      ...team,
      score: gameState.teamScores[index],
    }))
    .sort((a, b) => b.score - a.score);

  const medals = ["🥇", "🥈", "🥉", "🎖️"];
  listContainer.innerHTML = rankings
    .map(
      (team, rank) => `
        <div class="flex items-center justify-between bg-white/5 p-5 rounded-[1.5rem] border border-white/5 slide-up shadow-lg transform-gpu" style="animation-delay: ${rank * 0.1}s">
            <div class="flex items-center gap-4">
                <span class="text-3xl">${medals[rank] || medals[3]}</span>
                <div>
                    <p class="text-white font-black text-sm uppercase italic tracking-wider">${team.name.split(" ")[1]}</p>
                    <p class="text-[10px] text-white/30 font-black uppercase">Hạng ${rank + 1}</p>
                </div>
            </div>
            <p class="text-white font-black text-2xl tabular-nums">${team.score}</p>
        </div>`,
    )
    .join("");

  if (isRoundEnd) {
    const roundNote = document.getElementById("round-notification");
    roundNote.textContent = "✨ VÒNG MỚI BẮT ĐẦU! ✨";
    roundNote.className =
      "text-yellow-400 text-xs font-black uppercase tracking-[0.4em] animate-bounce bg-white/10 py-3 rounded-2xl";
    setTimeout(() => {
      roundNote.textContent = "Đang thi đấu...";
      roundNote.className =
        "text-cyan-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse bg-black/20 py-3 rounded-2xl";
    }, 3000);
  }
}

// 11. CẬP NHẬT UI (TARGETED UPDATE - KHÔNG RENDER LẠI GRID)
function updateUI() {
  // Cập nhật điểm từng đội trực tiếp qua ID
  gameState.teamScores.forEach((score, i) => {
    const el = document.getElementById(`score-team-${i}`);
    if (el) el.textContent = score;
  });

  document.getElementById("progress").textContent =
    `${gameState.answered.length}/36`;

  // Chỉ cập nhật duy nhất ô vừa trả lời
  if (gameState.currentCell !== null) {
    const cell = document.getElementById(`cell-${gameState.currentCell}`);
    if (cell) {
      cell.disabled = true;
      cell.innerHTML = "✓";
      cell.classList.remove(
        "bg-gradient-to-br",
        "from-cyan-500",
        "to-teal-600",
        "animate-pulse",
        "ring-2",
        "ring-yellow-300",
      );
      cell.classList.add("bg-slate-700", "opacity-30", "cursor-not-allowed");
      cell.onclick = null;
    }
  }
}

// 12. UI HELPERS (Modals)
function showResultModal(isCorrect, points, correct, team) {
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const detail = document.getElementById("result-detail");

  if (isCorrect) {
    icon.textContent = "🎉";
    title.textContent = "CHÍNH XÁC!";
    title.className =
      "text-5xl font-black mb-6 text-green-500 uppercase italic";
    detail.innerHTML = `${team.name} ghi được: <br><span class="text-green-400 font-black text-4xl">+${points} ĐIỂM</span>`;
  } else {
    icon.textContent = "❌";
    title.textContent = "SAI RỒI!";
    title.className = "text-5xl font-black mb-6 text-red-500 uppercase italic";
    detail.innerHTML = `Đáp án đúng là: <br><span class="text-white font-black text-3xl italic underline">${correct}</span>`;
  }
  showModal("result-modal");
}

function closeResultModal() {
  closeModal("result-modal");
  updateUI();
}

function showModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "flex";
    el.classList.remove("hidden");
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "none";
    el.classList.add("hidden");
  }
}

// 13. AUDIO & VOLUME LOGIC
const bgMusic = document.getElementById("bg-music");
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.getElementById("volume-value");
const musicWaves = document.getElementById("music-waves");
const playIcon = document.getElementById("play-icon");

let isMusicPlaying = false;
bgMusic.volume = 0.5;

document.getElementById("music-toggle").onclick = () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    playIcon.textContent = "▶";
    musicWaves.classList.add("opacity-0");
  } else {
    bgMusic.play().catch(() => {});
    playIcon.textContent = "⏸";
    musicWaves.classList.remove("opacity-0");
  }
  isMusicPlaying = !isMusicPlaying;
};

volumeSlider.oninput = (e) => {
  const vol = e.target.value;
  bgMusic.volume = vol;
  volumeValue.textContent = Math.round(vol * 100) + "%";
  volumeValue.style.color = vol == 0 ? "#ef4444" : "#22d3ee";
};

// 14. KHỞI ĐỘNG
document.getElementById("start-btn").onclick = () => {
  document.getElementById("welcome-screen").style.display = "none";
  const gameScreen = document.getElementById("game-screen");
  gameScreen.classList.remove("hidden");
  gameScreen.style.display = "flex";

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

document.getElementById("reset-btn").onclick = () => {
  if (confirm("Làm mới trò chơi?")) location.reload();
};
