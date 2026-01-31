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

// 3. Hiển thị bảng điểm nhanh
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

    // Ô số 1 (index 0) sẽ có màu đặc biệt để nhận biết là Boss/Mini-game
    let bgClass = isAnswered
      ? "bg-slate-700 opacity-30 cursor-not-allowed"
      : "bg-gradient-to-br from-cyan-500 to-teal-600 hover:scale-105 active:scale-95";

    if (i === 0 && !isAnswered) {
      bgClass =
        "bg-gradient-to-br from-yellow-500 to-orange-600 hover:scale-105 active:scale-95 ring-2 ring-yellow-300 animate-pulse";
    }

    cell.className = `cell-btn aspect-square rounded-xl font-bold text-white shadow-lg transition-all text-sm md:text-base ${bgClass}`;

    // Thêm icon đặc biệt cho ô số 1
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

  // Đổi tiêu đề nếu là Mini-game
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

// 6. Sau khi chọn đội -> Phân luồng logic (Game thường vs Mini-game)
function selectTeam(teamIdx) {
  gameState.currentTeam = teamIdx;

  // Ghi nhận lượt chơi
  if (!gameState.teamsAnsweredThisRound.includes(teamIdx)) {
    gameState.teamsAnsweredThisRound.push(teamIdx);
  }

  closeModal("team-modal");

  // Setup thông tin Intro
  const spec = gameState.currentSpecialType;
  document.getElementById("intro-icon").textContent = spec.icon;
  document.getElementById("intro-name").textContent = spec.name;
  document.getElementById("intro-desc").textContent = spec.description;

  // Hiện Intro
  showModal("special-intro-modal");

  // Sau 1.8s thì quyết định chơi game gì
  setTimeout(() => {
    closeModal("special-intro-modal");

    // === LOGIC TÍCH HỢP MINI-GAME TẠI ĐÂY ===
    if (gameState.currentCell === 0) {
      // Nếu là ô số 1: Gọi hàm từ file minigame_match.js
      if (typeof startMatchingGame === "function") {
        startMatchingGame((isWin) => {
          handleMinigameResult(isWin);
        });
      } else {
        console.error("Chưa load file minigame_match.js!");
        setupQuestion(); // Fallback về câu hỏi thường nếu lỗi
      }
    } else {
      // Các ô khác: Câu hỏi trắc nghiệm bình thường
      setupQuestion();
    }
  }, 1800);
}

// 7. Hàm xử lý kết quả riêng cho Mini-game
function handleMinigameResult(isSuccess) {
  const teamIdx = gameState.currentTeam;
  const spec = gameState.currentSpecialType.type;
  let points = 0;

  if (isSuccess) {
    // Mini-game khó hơn nên điểm gốc là 20
    points = 20;

    // Áp dụng ô đặc biệt
    if (spec === "double") points *= 2;
    if (spec === "lose") points = -5;
    if (spec === "random") points = Math.floor(Math.random() * 21) + 10;
    if (spec === "skip") points = 0;
  }

  // Cập nhật điểm và trạng thái
  gameState.teamScores[teamIdx] += points;
  gameState.answered.push(gameState.currentCell);

  // Hiển thị kết quả (Tự chế nội dung thay vì dùng showResultModal mặc định)
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const detail = document.getElementById("result-detail");
  const team = teams[teamIdx];

  if (isSuccess) {
    icon.textContent = "🏆";
    title.textContent = "CHIẾN THẮNG!";
    title.className =
      "text-3xl font-black mb-2 text-yellow-400 uppercase italic";
    detail.innerHTML = `${team.name} đã hoàn thành xuất sắc Mini-game và nhận <span class="text-yellow-500 font-black text-2xl">${points} điểm</span>!`;
  } else {
    icon.textContent = "💀";
    title.textContent = "THẤT BẠI!";
    title.className =
      "text-3xl font-black mb-2 text-slate-500 uppercase italic";
    detail.innerHTML = `${team.name} chưa hoàn thành nhiệm vụ kết nối.`;
  }
  showModal("result-modal");

  // Kiểm tra vòng chơi
  checkRoundEnd();
}

// 8. Chuẩn bị câu hỏi trắc nghiệm (Game thường)
function setupQuestion() {
  const q = vocabularyData[gameState.currentCell];
  const spec = gameState.currentSpecialType;

  // Tag loại ô
  const tag = document.getElementById("special-tag");
  tag.innerHTML = `
        <div class="flex flex-col items-center bg-gradient-to-r ${spec.color} text-white px-6 py-2 rounded-2xl shadow-xl animate-bounce border-4 border-white">
            <span class="text-2xl">${spec.icon}</span>
            <span class="text-xs font-black uppercase">${spec.name}</span>
        </div>
    `;

  document.getElementById("question-word").textContent = q.word;
  const optionsContainer = document.getElementById("options-container");
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

  optionsContainer.innerHTML = shuffledOptions
    .map(
      (opt) => `
        <button onclick="checkAnswer('${opt}', '${q.correct}')" class="group w-full p-5 rounded-2xl font-bold text-left bg-slate-700 border-2 border-slate-600 hover:border-cyan-400 hover:bg-slate-600 transition-all flex justify-between items-center shadow-lg">
            <span class="text-white group-hover:text-cyan-300 text-lg">${opt}</span>
            <span class="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">⚡</span>
        </button>
    `,
    )
    .join("");

  showModal("question-modal");
}

// 9. Kiểm tra đáp án trắc nghiệm
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

// 10. Hàm kiểm tra kết thúc vòng (Dùng chung)
function checkRoundEnd() {
  const isRoundEnd = gameState.teamsAnsweredThisRound.length === 4;
  if (isRoundEnd) {
    gameState.teamsAnsweredThisRound = [];
  }
  updateLeaderboard(isRoundEnd);
}

// 11. Cập nhật Leaderboard
function updateLeaderboard(isRoundEnd) {
  const listContainer = document.getElementById("leaderboard-list");
  const roundNote = document.getElementById("round-notification");

  // Sắp xếp
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
            <div class="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 slide-up" style="animation-delay: ${rank * 0.1}s">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${medals[rank] || medals[3]}</span>
                    <div>
                        <p class="text-white font-black text-xs uppercase italic">${team.name.split(" ")[1]}</p>
                        <p class="text-[10px] text-white/40 font-bold">Hạng ${rank + 1}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-white font-black text-xl">${team.score}</p>
                </div>
            </div>
        `;
    })
    .join("");

  if (isRoundEnd) {
    roundNote.textContent = "✨ VÒNG MỚI BẮT ĐẦU! ✨";
    roundNote.className =
      "text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] animate-bounce bg-white/10 px-4 py-2 rounded-full";
    setTimeout(() => {
      roundNote.textContent = "Đang trong vòng chơi";
      roundNote.className =
        "text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse bg-black/20 px-4 py-2 rounded-full";
    }, 3000);
  }
}

// Helpers hiển thị Modal
function showResultModal(isCorrect, points, correct, team) {
  const icon = document.getElementById("result-icon");
  const title = document.getElementById("result-title");
  const detail = document.getElementById("result-detail");

  if (isCorrect) {
    icon.textContent = "🎉";
    title.textContent = "CHÍNH XÁC!";
    title.className =
      "text-3xl font-black mb-2 text-green-500 uppercase italic";
    detail.innerHTML = `${team.name} nhận được <span class="text-green-600 font-black text-2xl">${points} điểm</span>!`;
  } else {
    icon.textContent = "❌";
    title.textContent = "SAI RỒI!";
    title.className = "text-3xl font-black mb-2 text-red-500 uppercase italic";
    detail.innerHTML = `Đáp án đúng: <br><span class="text-slate-300 font-black text-xl">${correct}</span>`;
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
  renderScoreBoard(); // Cập nhật điểm nhỏ
  document.getElementById("progress").textContent =
    `${gameState.answered.length}/36`;
  createGameGrid();
}

// --- KHỞI ĐỘNG ---
document.getElementById("start-btn").onclick = () => {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  document.getElementById("game-screen").classList.add("flex"); // Fix layout flex
  initializeCellTypes();
  renderScoreBoard();
  createGameGrid();
  updateLeaderboard(false);
};

document.getElementById("reset-btn").onclick = () => {
  if (confirm("Làm mới trò chơi?")) location.reload();
};
