// 1. Khởi tạo trạng thái game
let gameState = {
  teamScores: [0, 0, 0, 0],
  answered: [],
  currentCell: null,
  cellTypes: [],
  currentSpecialType: null,
  currentTeam: null,
  teamsAnsweredThisRound: [],
};

// 2. Hàm khởi tạo hệ thống ô đặc biệt
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

// 3. Hiển thị bảng điểm nhanh phía trên
function renderScoreBoard() {
  const container = document.getElementById("score-container");
  if (!container) return;

  container.innerHTML = teams
    .map(
      (team, i) => `
        <div class="bg-gradient-to-r ${team.color} rounded-2xl px-2 py-3 shadow-lg text-white transform transition-all">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xl">${team.icon}</span>
                <span class="text-[10px] font-black uppercase opacity-70">${team.name.split(" ")[1]}</span>
            </div>
            <p id="score-team-${i}" class="text-2xl font-black text-center">${gameState.teamScores[i]}</p>
        </div>
    `,
    )
    .join("");
}

// 4. Tạo lưới 36 ô số
function createGameGrid() {
  const grid = document.getElementById("game-grid");
  if (!grid) return;

  grid.innerHTML = "";
  for (let i = 0; i < 36; i++) {
    const isAnswered = gameState.answered.includes(i);
    const cell = document.createElement("button");

    let bgClass = isAnswered
      ? "bg-slate-700 opacity-30 cursor-not-allowed"
      : "bg-gradient-to-br from-cyan-500 to-teal-600 hover:scale-105 active:scale-95";

    if (i === 0 && !isAnswered) {
      bgClass =
        "bg-gradient-to-br from-yellow-500 to-orange-600 hover:scale-105 active:scale-95 ring-2 ring-yellow-300 animate-pulse";
    }

    cell.className = `cell-btn aspect-square rounded-xl font-bold text-white shadow-lg transition-all text-sm md:text-base ${bgClass}`;
    cell.innerHTML = isAnswered ? "✓" : i === 0 ? "★" : i + 1;

    cell.disabled = isAnswered;
    if (!isAnswered) cell.onclick = () => handleCellClick(i);

    grid.appendChild(cell);
  }
}

// 5. Xử lý khi chọn một ô
function handleCellClick(index) {
  gameState.currentCell = index;
  const typeKey = gameState.cellTypes[index];
  gameState.currentSpecialType = specialTypes.find((t) => t.type === typeKey);

  const title =
    index === 0 ? "⚡ THỬ THÁCH ĐẶC BIỆT ⚡" : `THỬ THÁCH SỐ ${index + 1}`;
  document.getElementById("modal-cell-info").textContent = title;

  const teamOptions = document.getElementById("team-options");
  teamOptions.innerHTML = teams
    .map((team, i) => {
      const hasPlayed = gameState.teamsAnsweredThisRound.includes(i);
      return `
            <button 
                onclick="${hasPlayed ? "" : `selectTeam(${i})`}" 
                class="bg-gradient-to-r ${team.color} p-4 rounded-2xl text-white font-bold transition-all shadow-lg 
                ${hasPlayed ? "opacity-20 cursor-not-allowed grayscale" : "hover:scale-105 active:brightness-90"}"
                ${hasPlayed ? "disabled" : ""}
            >
                <div class="text-3xl mb-1">${hasPlayed ? "🚫" : team.icon}</div>
                <div class="text-xs uppercase tracking-widest">${team.name}</div>
            </button>
        `;
    })
    .join("");

  showModal("team-modal");
}

// 6. Sau khi chọn đội -> Hiện Intro
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
    if (gameState.currentCell === 0) {
      if (typeof startMatchingGame === "function") {
        startMatchingGame((isWin) => handleMinigameResult(isWin));
      } else {
        setupQuestion();
      }
    } else {
      setupQuestion();
    }
  }, 1800);
}

// 7. Xử lý Mini-game
function handleMinigameResult(isSuccess) {
  const teamIdx = gameState.currentTeam;
  const spec = gameState.currentSpecialType.type;
  let points = isSuccess ? 20 : 0;

  if (isSuccess) {
    if (spec === "double") points *= 2;
    if (spec === "lose") points = -5;
    if (spec === "random") points = Math.floor(Math.random() * 21) + 10;
    if (spec === "skip") points = 0;
  }

  gameState.teamScores[teamIdx] += points;
  gameState.answered.push(gameState.currentCell);

  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const detail = document.getElementById("result-detail");

  if (isSuccess) {
    icon.textContent = "🏆";
    title.textContent = "CHIẾN THẮNG!";
    title.className =
      "text-5xl font-black mb-6 text-yellow-400 uppercase italic";
    detail.innerHTML = `${teams[teamIdx].name} đã hoàn thành Mini-game: <br><span class="text-yellow-500 font-black text-4xl">+${points} ĐIỂM</span>`;
  } else {
    icon.textContent = "💀";
    title.textContent = "THẤT BẠI!";
    title.className =
      "text-5xl font-black mb-6 text-slate-500 uppercase italic";
    detail.textContent = "Nhiệm vụ chưa hoàn thành.";
  }
  showModal("result-modal");
  checkRoundEnd();
}

// 8. Chuẩn bị câu hỏi trắc nghiệm
function setupQuestion() {
  const q = vocabularyData[gameState.currentCell];
  const spec = gameState.currentSpecialType;

  const tag = document.getElementById("special-tag");
  tag.innerHTML = `
        <div class="flex flex-col items-center bg-gradient-to-r ${spec.color} text-white px-8 py-3 rounded-[2rem] shadow-2xl animate-bounce border-4 border-white">
            <span class="text-3xl">${spec.icon}</span>
            <span class="text-sm font-black uppercase tracking-widest">${spec.name}</span>
        </div>
    `;

  document.getElementById("question-word").textContent = q.word;
  const optionsContainer = document.getElementById("options-container");
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  optionsContainer.innerHTML = shuffledOptions
    .map(
      (opt) => `
        <button onclick="checkAnswer('${opt}', '${q.correct}')" class="group w-full p-6 rounded-[2rem] font-black text-left bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 transition-all flex justify-between items-center shadow-lg">
            <span class="text-white group-hover:text-cyan-300 text-xl">${opt}</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">⚡</span>
        </button>
    `,
    )
    .join("");

  showModal("question-modal");
}

// 9. Kiểm tra đáp án
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

function checkRoundEnd() {
  const isRoundEnd = gameState.teamsAnsweredThisRound.length === 4;
  if (isRoundEnd) gameState.teamsAnsweredThisRound = [];
  updateLeaderboard(isRoundEnd);
}

// 10. Cập nhật Leaderboard
function updateLeaderboard(isRoundEnd) {
  const listContainer = document.getElementById("leaderboard-list");
  const roundNote = document.getElementById("round-notification");

  const rankings = teams
    .map((team, index) => ({
      ...team,
      score: gameState.teamScores[index],
    }))
    .sort((a, b) => b.score - a.score);

  listContainer.innerHTML = rankings
    .map((team, rank) => {
      const medals = ["🥇", "🥈", "🥉", "🎖️"];
      return `
            <div class="flex items-center justify-between bg-white/5 p-5 rounded-[1.5rem] border border-white/5 slide-up shadow-lg" style="animation-delay: ${rank * 0.1}s">
                <div class="flex items-center gap-4">
                    <span class="text-3xl">${medals[rank] || medals[3]}</span>
                    <div>
                        <p class="text-white font-black text-sm uppercase italic tracking-wider">${team.name.split(" ")[1]}</p>
                        <p class="text-[10px] text-white/30 font-black uppercase">Hạng ${rank + 1}</p>
                    </div>
                </div>
                <p class="text-white font-black text-2xl">${team.score}</p>
            </div>
        `;
    })
    .join("");

  if (isRoundEnd) {
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

// 11. UI Helpers
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
    el.classList.remove("hidden");
    el.classList.add("flex");
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("flex");
    el.classList.add("hidden");
  }
}

function updateUI() {
  renderScoreBoard();
  document.getElementById("progress").textContent =
    `${gameState.answered.length}/36`;
  createGameGrid();
}

// --- 12. LOGIC ĐIỀU KHIỂN NHẠC NỀN ---
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const playIcon = document.getElementById("play-icon");
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.getElementById("volume-value");
const musicWaves = document.getElementById("music-waves");

let isMusicPlaying = false;
bgMusic.volume = 0.5;

musicToggle.onclick = () => {
  if (isMusicPlaying) {
    bgMusic.pause();
    playIcon.textContent = "▶";
    musicWaves.classList.add("opacity-0");
  } else {
    bgMusic.play().catch(() => console.log("User interaction required"));
    playIcon.textContent = "⏸";
    musicWaves.classList.remove("opacity-0");
  }
  isMusicPlaying = !isMusicPlaying;
};

volumeSlider.oninput = (e) => {
  const vol = e.target.value;
  bgMusic.volume = vol;
  volumeValue.textContent = Math.round(vol * 100) + "%";
  volumeValue.className =
    vol == 0 ? "text-red-500 font-black" : "text-cyan-400 font-black";
};

// --- KHỞI ĐỘNG ---
document.getElementById("start-btn").onclick = () => {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("game-screen").classList.add("flex");
  initializeCellTypes();
  renderScoreBoard();
  createGameGrid();
  updateLeaderboard(false);

  // Tự động phát nhạc khi nhấn bắt đầu
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
