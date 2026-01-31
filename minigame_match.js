// minigame_match.js

let matchState = {
  selectedWord: null, // Lưu thẻ DOM của từ đang chọn
  selectedDef: null, // Lưu thẻ DOM của nghĩa đang chọn
  pairsLeft: 0, // Số cặp còn lại
  totalPairs: 0, // Tổng số cặp
  onComplete: null, // Hàm gọi lại khi thắng
};

// Dữ liệu mẫu cho ô số 1
const matchingData = [
  { id: 1, word: "Firewall", def: "Tường lửa bảo vệ mạng" },
  { id: 2, word: "Malware", def: "Phần mềm độc hại" },
  { id: 3, word: "Phishing", def: "Tấn công lừa đảo" },
  { id: 4, word: "Encryption", def: "Mã hóa dữ liệu" },
  { id: 5, word: "Hacker", def: "Tin tặc máy tính" },
];

// Hàm khởi động Mini-game
function startMatchingGame(callback) {
  matchState.onComplete = callback;
  matchState.pairsLeft = matchingData.length;
  matchState.totalPairs = matchingData.length;
  matchState.selectedWord = null;
  matchState.selectedDef = null;

  // Render giao diện
  const colWords = document.getElementById("col-words");
  const colDefs = document.getElementById("col-defs");

  colWords.innerHTML = "";
  colDefs.innerHTML = "";
  updateMatchProgress(0);

  // Trộn ngẫu nhiên nghĩa để game khó hơn
  const shuffledDefs = [...matchingData].sort(() => Math.random() - 0.5);

  // Tạo cột Từ (Bên trái)
  matchingData.forEach((item) => {
    const btn = createMatchBtn(item.word, "word", item.id);
    colWords.appendChild(btn);
  });

  // Tạo cột Nghĩa (Bên phải)
  shuffledDefs.forEach((item) => {
    const btn = createMatchBtn(item.def, "def", item.id);
    colDefs.appendChild(btn);
  });

  // Hiện Modal
  const modal = document.getElementById("minigame-match-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// Hàm tạo nút bấm
function createMatchBtn(text, type, id) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.dataset.id = id; // Lưu ID để so sánh
  btn.dataset.type = type; // 'word' hoặc 'def'
  btn.className = `
        w-full p-4 rounded-xl font-bold text-white text-left transition-all duration-200 border-2
        bg-white/10 border-white/10 hover:bg-white/20
    `;
  btn.onclick = () => handleMatchClick(btn);
  return btn;
}

// Xử lý khi bấm vào nút
function handleMatchClick(btn) {
  // Nếu nút đã hoàn thành (đúng rồi) thì bỏ qua
  if (btn.classList.contains("matched")) return;

  const type = btn.dataset.type;

  // 1. Xử lý highlight (Chọn)
  if (type === "word") {
    if (matchState.selectedWord)
      matchState.selectedWord.classList.remove(
        "ring-4",
        "ring-yellow-400",
        "bg-yellow-500/20",
      );
    matchState.selectedWord = btn;
  } else {
    if (matchState.selectedDef)
      matchState.selectedDef.classList.remove(
        "ring-4",
        "ring-yellow-400",
        "bg-yellow-500/20",
      );
    matchState.selectedDef = btn;
  }

  // Thêm hiệu ứng đang chọn
  btn.classList.add("ring-4", "ring-yellow-400", "bg-yellow-500/20");

  // 2. Kiểm tra khớp (Nếu đã chọn cả 2 bên)
  if (matchState.selectedWord && matchState.selectedDef) {
    checkPair();
  }
}

function checkPair() {
  const wordBtn = matchState.selectedWord;
  const defBtn = matchState.selectedDef;

  // Disable click tạm thời
  const wordId = wordBtn.dataset.id;
  const defId = defBtn.dataset.id;

  if (wordId === defId) {
    // --- ĐÚNG ---
    handleCorrect(wordBtn, defBtn);
  } else {
    // --- SAI ---
    handleWrong(wordBtn, defBtn);
  }

  // Reset lựa chọn
  matchState.selectedWord = null;
  matchState.selectedDef = null;
}

function handleCorrect(b1, b2) {
  // Hiệu ứng đúng (Xanh lá)
  [b1, b2].forEach((btn) => {
    btn.classList.remove(
      "ring-4",
      "ring-yellow-400",
      "bg-yellow-500/20",
      "bg-white/10",
    );
    btn.classList.add(
      "bg-green-500",
      "border-green-400",
      "matched",
      "scale-95",
      "opacity-50",
      "cursor-not-allowed",
    );
  });

  matchState.pairsLeft--;
  const percent =
    ((matchState.totalPairs - matchState.pairsLeft) / matchState.totalPairs) *
    100;
  updateMatchProgress(percent);

  // Kiểm tra thắng cuộc
  if (matchState.pairsLeft === 0) {
    setTimeout(() => {
      closeMatchingGame();
      if (matchState.onComplete) matchState.onComplete(true); // Báo về game chính là đã thắng
    }, 1000);
  }
}

function handleWrong(b1, b2) {
  // Hiệu ứng sai (Đỏ + Rung)
  [b1, b2].forEach((btn) => {
    btn.classList.remove("ring-yellow-400", "bg-yellow-500/20");
    btn.classList.add("bg-red-500", "ring-4", "ring-red-400", "shake");
  });

  // Reset lại sau 0.5s
  setTimeout(() => {
    [b1, b2].forEach((btn) => {
      btn.classList.remove("bg-red-500", "ring-4", "ring-red-400", "shake");
      btn.classList.add("bg-white/10"); // Trả về màu cũ
    });
  }, 500);
}

function updateMatchProgress(percent) {
  document.getElementById("match-progress").style.width = `${percent}%`;
}

function closeMatchingGame() {
  const modal = document.getElementById("minigame-match-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
}
