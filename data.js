// Bộ từ vựng 36 câu
const vocabularyData = [
  {
    word: "Abundant",
    correct: "Dồi dào",
    options: ["Dồi dào", "Khan hiếm", "Bình thường", "Nhỏ bé"],
  },
  {
    word: "Benevolent",
    correct: "Nhân từ",
    options: ["Độc ác", "Nhân từ", "Lạnh lùng", "Vội vàng"],
  },
  {
    word: "Cautious",
    correct: "Thận trọng",
    options: ["Liều lĩnh", "Nhanh nhẹn", "Thận trọng", "Chậm chạp"],
  },
  {
    word: "Diligent",
    correct: "Siêng năng",
    options: ["Lười biếng", "Siêng năng", "Thông minh", "Ngu ngốc"],
  },
  {
    word: "Eloquent",
    correct: "Hùng biện",
    options: ["Im lặng", "Hùng biện", "Nhút nhát", "Ồn ào"],
  },
  {
    word: "Ferocious",
    correct: "Hung dữ",
    options: ["Hiền lành", "Đáng yêu", "Hung dữ", "Buồn bã"],
  },
  {
    word: "Generous",
    correct: "Hào phóng",
    options: ["Keo kiệt", "Hào phóng", "Tham lam", "Ích kỷ"],
  },
  {
    word: "Humble",
    correct: "Khiêm tốn",
    options: ["Kiêu ngạo", "Tự tin", "Khiêm tốn", "Xấu hổ"],
  },
  {
    word: "Immense",
    correct: "To lớn",
    options: ["Nhỏ xíu", "To lớn", "Vừa phải", "Tí hon"],
  },
  {
    word: "Jubilant",
    correct: "Vui mừng",
    options: ["Buồn rầu", "Tức giận", "Vui mừng", "Lo lắng"],
  },
  {
    word: "Keen",
    correct: "Sắc bén",
    options: ["Cùn", "Sắc bén", "Mờ nhạt", "Yếu ớt"],
  },
  {
    word: "Lament",
    correct: "Than khóc",
    options: ["Cười đùa", "Than khóc", "Ca hát", "Nhảy múa"],
  },
  {
    word: "Magnificent",
    correct: "Tráng lệ",
    options: ["Xấu xí", "Bình thường", "Tráng lệ", "Đơn giản"],
  },
  {
    word: "Notorious",
    correct: "Khét tiếng",
    options: ["Nổi tiếng", "Khét tiếng", "Vô danh", "Bí ẩn"],
  },
  {
    word: "Obsolete",
    correct: "Lỗi thời",
    options: ["Hiện đại", "Lỗi thời", "Mới mẻ", "Tiên tiến"],
  },
  {
    word: "Peculiar",
    correct: "Kỳ lạ",
    options: ["Bình thường", "Kỳ lạ", "Phổ biến", "Quen thuộc"],
  },
  {
    word: "Reluctant",
    correct: "Miễn cưỡng",
    options: ["Háo hức", "Miễn cưỡng", "Vui vẻ", "Sẵn sàng"],
  },
  {
    word: "Serene",
    correct: "Thanh bình",
    options: ["Ồn ào", "Hỗn loạn", "Thanh bình", "Náo nhiệt"],
  },
  {
    word: "Tedious",
    correct: "Tẻ nhạt",
    options: ["Thú vị", "Tẻ nhạt", "Hấp dẫn", "Kịch tính"],
  },
  {
    word: "Vivid",
    correct: "Sống động",
    options: ["Mờ nhạt", "Sống động", "Tối tăm", "Nhạt nhẽo"],
  },
  {
    word: "Wicked",
    correct: "Độc ác",
    options: ["Tốt bụng", "Độc ác", "Trung lập", "Dễ thương"],
  },
  {
    word: "Zealous",
    correct: "Nhiệt tình",
    options: ["Lãnh đạm", "Nhiệt tình", "Thờ ơ", "Bàng quan"],
  },
  {
    word: "Ambitious",
    correct: "Tham vọng",
    options: ["Khiêm tốn", "Tham vọng", "Thụ động", "Bình thường"],
  },
  {
    word: "Brilliant",
    correct: "Xuất sắc",
    options: ["Tầm thường", "Xuất sắc", "Bình thường", "Yếu kém"],
  },
  {
    word: "Clumsy",
    correct: "Vụng về",
    options: ["Khéo léo", "Nhanh nhẹn", "Vụng về", "Tinh tế"],
  },
  {
    word: "Delicate",
    correct: "Tinh tế",
    options: ["Thô lỗ", "Cứng rắn", "Tinh tế", "Mạnh mẽ"],
  },
  {
    word: "Eager",
    correct: "Háo hức",
    options: ["Chán nản", "Háo hức", "Mệt mỏi", "Lo lắng"],
  },
  {
    word: "Fierce",
    correct: "Dữ dội",
    options: ["Nhẹ nhàng", "Dữ dội", "Yếu ớt", "Dịu dàng"],
  },
  {
    word: "Graceful",
    correct: "Duyên dáng",
    options: ["Vụng về", "Duyên dáng", "Thô kệch", "Nặng nề"],
  },
  {
    word: "Hostile",
    correct: "Thù địch",
    options: ["Thân thiện", "Thù địch", "Hòa nhã", "Ân cần"],
  },
  {
    word: "Innocent",
    correct: "Ngây thơ",
    options: ["Xảo quyệt", "Ngây thơ", "Gian xảo", "Tinh ranh"],
  },
  {
    word: "Jealous",
    correct: "Ghen tị",
    options: ["Hào phóng", "Ghen tị", "Vui vẻ", "Bình thản"],
  },
  {
    word: "Loyal",
    correct: "Trung thành",
    options: ["Phản bội", "Trung thành", "Bất trung", "Thất thường"],
  },
  {
    word: "Naive",
    correct: "Ngây ngô",
    options: ["Tinh vi", "Ngây ngô", "Sắc sảo", "Thông minh"],
  },
  {
    word: "Optimistic",
    correct: "Lạc quan",
    options: ["Bi quan", "Lạc quan", "Suy sụp", "Buồn bã"],
  },
  {
    word: "Patient",
    correct: "Kiên nhẫn",
    options: ["Nóng vội", "Kiên nhẫn", "Vội vã", "Thiếu kiên trì"],
  },
];

// Cấu hình các loại ô
const specialTypes = [
  {
    type: "normal",
    icon: "💯",
    name: "Normal",
    color: "from-blue-500 to-blue-600",
    description: "+10 points if correct",
  },
  {
    type: "double",
    icon: "✨",
    name: "Double x2",
    color: "from-yellow-400 to-orange-500",
    description: "x2 points if correct!",
  },
  {
    type: "lose",
    icon: "💔",
    name: "Penalty",
    color: "from-red-500 to-pink-600",
    description: "-5 points penalty",
  },
  {
    type: "random",
    icon: "🎲",
    name: "Random",
    color: "from-purple-500 to-pink-500",
    description: "Random 5-20 points",
  },
  {
    type: "skip",
    icon: "⏭️",
    name: "Skip",
    color: "from-gray-600 to-gray-700",
    description: "No points",
  },
];

// Cấu hình các đội
const teams = [
  {
    name: "Team Red",
    icon: "🔴",
    color: "from-red-400 to-red-500",
    textColor: "text-red-500",
  },
  {
    name: "Team Blue",
    icon: "🔵",
    color: "from-blue-400 to-blue-500",
    textColor: "text-blue-500",
  },
  {
    name: "Team Green",
    icon: "🟢",
    color: "from-green-400 to-green-500",
    textColor: "text-green-500",
  },
  {
    name: "Team Yellow",
    icon: "🟡",
    color: "from-yellow-400 to-yellow-500",
    textColor: "text-yellow-500",
  },
];
ss;
