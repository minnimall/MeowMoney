import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  User as UserIcon,
  Mail,
  Sun,
  Moon,
  FilterX,
  Search,
  Settings,
  Download,
  Heart,
  Sparkles,
  Repeat,
  Target,
  PiggyBank,
  Star,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import logoMeowMoney from "../assets/logomeowv2.png";
import catSad from "../assets/แมวเศร้า.jpg";
import catNormal from "../assets/แมวปกติ.jpg";
import catStreak from "../assets/แมวร้าก.jpg";
import popcat from "../assets/popcat.png";
import Tesseract from "tesseract.js";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService";
import {
  getFavorites,
  createFavorite,
  deleteFavorite,
} from "../services/favoriteService";
import {
  getRecurring,
  createRecurring,
  deleteRecurring,
  generateDueTransactions,
} from "../services/recurringService";
import { getSettings, updateSettings } from "../services/settingsService";
import { getStoredUser, updateProfile, logout } from "../services/authService";
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  depositToSavingsGoal,
} from "../services/savingsGoalService";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const THEMES = {
  light: {
    bg: "#f4f1fc",
    card: "#ffffff",
    cardAlt: "#ede6fb",
    border: "#e3daf7",
    accent: "#6c5ce7",
    accent2: "#9b6bf0",
    accentPink: "#ff6fa0",
    accentContrast: "#ffffff",
    textDark: "#241d3d",
    textMuted: "#8a81a8",
    income: "#22b07d",
    incomeBg: "#e0f7ee",
    expense: "#ff6f61",
    expenseBg: "#ffeae6",
    warn: "#f0a93b",
    warnBg: "#fff2dc",
    inputBg: "#ffffff",
    overlay: "rgba(36,29,61,0.45)",
    litEdge: "rgba(255,255,255,0.9)",
    darkEdge: "rgba(108,92,231,0.16)",
    wellShadow: "rgba(36,29,61,0.14)",
    shadowCard:
      "-6px -6px 14px rgba(255,255,255,0.85), 8px 10px 22px rgba(108,92,231,0.16)",
    shadowCardPressed:
      "-2px -2px 6px rgba(255,255,255,0.7), 3px 4px 10px rgba(108,92,231,0.18)",
    shadowBalance:
      "-6px -6px 16px rgba(255,150,190,0.35), 10px 14px 28px rgba(108,92,231,0.38)",
    shadowLogo: "0 4px 14px rgba(108,92,231,0.22)",
    shadowBtn:
      "-3px -3px 8px rgba(255,255,255,0.7), 4px 6px 14px rgba(108,92,231,0.28)",
    shadowBtnPressed: "inset 2px 2px 6px rgba(0,0,0,0.18)",
    shadowWell:
      "inset 2px 3px 6px rgba(36,29,61,0.12), inset -2px -2px 4px rgba(255,255,255,0.6)",
  },
  dark: {
    bg: "#150f26",
    card: "#1e1836",
    cardAlt: "#2a2247",
    border: "#372c55",
    accent: "#9b87f5",
    accent2: "#c084f5",
    accentPink: "#ff8fb6",
    accentContrast: "#150f26",
    textDark: "#f1edfb",
    textMuted: "#a79ecb",
    income: "#4fd9a6",
    incomeBg: "#1c3a30",
    expense: "#ff8a7a",
    expenseBg: "#3a2632",
    warn: "#f0c15a",
    warnBg: "#3a3020",
    inputBg: "#241d3d",
    overlay: "rgba(0,0,0,0.6)",
    litEdge: "rgba(255,255,255,0.06)",
    darkEdge: "rgba(0,0,0,0.55)",
    wellShadow: "rgba(0,0,0,0.6)",
    shadowCard:
      "-5px -5px 12px rgba(255,255,255,0.03), 9px 11px 24px rgba(0,0,0,0.55)",
    shadowCardPressed:
      "-2px -2px 6px rgba(255,255,255,0.02), 3px 4px 10px rgba(0,0,0,0.6)",
    shadowBalance:
      "-6px -6px 16px rgba(155,135,245,0.12), 10px 14px 30px rgba(0,0,0,0.6)",
    shadowLogo: "0 4px 14px rgba(0,0,0,0.5)",
    shadowBtn:
      "-3px -3px 8px rgba(255,255,255,0.04), 4px 6px 14px rgba(0,0,0,0.5)",
    shadowBtnPressed: "inset 2px 2px 6px rgba(0,0,0,0.5)",
    shadowWell:
      "inset 2px 3px 6px rgba(0,0,0,0.55), inset -2px -2px 4px rgba(255,255,255,0.03)",
  },
};

const CATEGORY_OPTIONS = {
  income: ["เงินเดือน", "โบนัส", "รายได้เสริม", "ของขวัญ", "อื่นๆ"],
  expense: [
    "ค่าอาหาร",
    "ค่าเดินทาง",
    "ค่าที่พัก",
    "บันเทิง",
    "ของใช้",
    "อื่นๆ",
  ],
};

const PIE_COLORS = [
  "#6c5ce7",
  "#ff6fa0",
  "#22b07d",
  "#f0a93b",
  "#9b6bf0",
  "#ff8a7a",
];

const EXPENSE_KEYWORDS = {
  ค่าอาหาร: ["ข้าว", "กิน", "อาหาร", "กาแฟ", "ก๋วยเตี๋ยว", "ชานม", "ขนม"],
  ค่าเดินทาง: [
    "รถ",
    "เดินทาง",
    "แท็กซี่",
    "bts",
    "mrt",
    "น้ำมัน",
    "วิน",
    "แกร็บ",
  ],
  ค่าที่พัก: ["หอ", "ที่พัก", "บ้าน", "ห้อง", "ค่าเช่า"],
  บันเทิง: ["หนัง", "เกม", "เที่ยว", "คอนเสิร์ต", "คาราโอเกะ"],
  ของใช้: ["ของใช้", "shopee", "lazada", "ซื้อของ", "สบู่"],
};
const INCOME_KEYWORDS = {
  เงินเดือน: ["เงินเดือน", "salary"],
  โบนัส: ["โบนัส", "bonus"],
  รายได้เสริม: ["ขายของ", "รายได้เสริม", "freelance", "ฟรีแลนซ์"],
};

const currentUser = getStoredUser();
// เก็บแค่ preference ของเครื่อง (darkMode) ไว้ใน localStorage เท่านั้น
// ข้อมูลอื่น (transactions, favorites, recurring, budgets, savingsGoal) ย้ายไปเก็บใน MongoDB ผ่าน API แล้ว
const DARKMODE_KEY = "meowmoney_darkmode";

function PawIcon({ size = 70, color = "#ffffff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="42" rx="18" ry="14" fill={color} />
      <circle cx="13" cy="23" r="7.5" fill={color} />
      <circle cx="26" cy="12" r="7" fill={color} />
      <circle cx="38" cy="12" r="7" fill={color} />
      <circle cx="51" cy="23" r="7.5" fill={color} />
    </svg>
  );
}
function lightenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
function formatBaht(n) {
  return `฿${Math.round(n).toLocaleString("th-TH")}`;
}
function formatDate(d) {
  return new Date(d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
// คืนค่า key ของสัปดาห์ปัจจุบัน อิงจากวันจันทร์เป็นวันเริ่มสัปดาห์ (ตามมาตรฐาน ISO)
// รูปแบบ: "2026-W29" (ปี-สัปดาห์ที่)
function weekKey(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const day = dt.getDay() || 7; // อาทิตย์ = 0 → เปลี่ยนเป็น 7
  dt.setDate(dt.getDate() + 4 - day); // เลื่อนไปวันพฤหัสของสัปดาห์นั้น (ISO week rule)
  const yearStart = new Date(dt.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
  return `${dt.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}
function monthShortLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("th-TH", {
    month: "short",
  });
}

// เรียนรู้ว่าคำ (จาก note) ไหนเคยถูกจัดเข้าหมวดไหนบ้าง จากประวัติจริงของผู้ใช้คนนี้
// ยิ่งใช้งานนาน ยิ่งเดาแม่นขึ้น เพราะเรียนรู้จากพฤติกรรมจริง ไม่ใช่ keyword ตายตัว
function buildLearnedKeywords(transactions) {
  const map = {}; // { type: { category: { word: count } } }
  transactions.forEach((t) => {
    if (!t.note) return;
    const cleanNote = t.note
      .replace(/\(อัตโนมัติ\)/g, "")
      .replace(/[0-9]/g, "")
      .trim();
    if (cleanNote.length < 2) return;

    // ตัด note เป็นชิ้นคำสั้นๆ ด้วย sliding window (เพราะภาษาไทยไม่มีช่องว่างคั่นคำ)
    // เก็บ substring ยาว 2-4 ตัวอักษร เป็น "คำ" ที่อาจมีความหมาย
    const chunks = new Set();
    for (let len = 2; len <= Math.min(4, cleanNote.length); len++) {
      for (let i = 0; i <= cleanNote.length - len; i++) {
        chunks.add(cleanNote.slice(i, i + len));
      }
    }

    if (!map[t.type]) map[t.type] = {};
    if (!map[t.type][t.category]) map[t.type][t.category] = {};
    chunks.forEach((chunk) => {
      map[t.type][t.category][chunk] =
        (map[t.type][t.category][chunk] || 0) + 1;
    });
  });
  return map;
}

function parseQuickAdd(text, learnedKeywords) {
  const match = text.trim().match(/(\d+(\.\d+)?)\s*$/);
  if (!match) return null;
  const amount = Math.abs(parseFloat(match[1]));
  if (!amount) return null;
  const noteText = text.slice(0, match.index).trim();
  const lowerNote = noteText.toLowerCase();

  function scoreCategories(staticKeywords, learnedMap) {
    const scores = {};

    // คะแนนจาก keyword ตายตัว (น้ำหนักสูง เพราะแม่นยำกว่า)
    Object.entries(staticKeywords).forEach(([cat, kws]) => {
      const hits = kws.filter((k) =>
        lowerNote.includes(k.toLowerCase()),
      ).length;
      if (hits > 0) scores[cat] = (scores[cat] || 0) + hits * 3;
    });

    // คะแนนจากประวัติที่เคยพิมพ์ไว้ (เรียนรู้เฉพาะตัวผู้ใช้)
    if (learnedMap) {
      Object.entries(learnedMap).forEach(([cat, words]) => {
        let hit = 0;
        Object.entries(words).forEach(([word, count]) => {
          if (lowerNote.includes(word.toLowerCase())) {
            hit += Math.min(count, 5); // จำกัด weight กันคำที่ใช้บ่อยเกินไปครอบงำ
          }
        });
        if (hit > 0) scores[cat] = (scores[cat] || 0) + hit;
      });
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : null;
  }

  // เดา type ก่อน (รายรับ/รายจ่าย) จากทั้ง static + learned
  const incomeCat = scoreCategories(INCOME_KEYWORDS, learnedKeywords?.income);
  const expenseCat = scoreCategories(
    EXPENSE_KEYWORDS,
    learnedKeywords?.expense,
  );

  let type = "expense";
  let category = expenseCat || "อื่นๆ";

  if (incomeCat) {
    type = "income";
    category = incomeCat;
  }

  return { amount, note: noteText || category, type, category };
}

function Modal({ open, onClose, children, title, wide }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`mm-surface w-full ${wide ? "max-w-[520px]" : "max-w-[420px]"} max-h-[88vh] overflow-y-auto overflow-x-hidden rounded-2xl bg-[var(--card)]`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-4">
          <h3 className="m-0 text-base font-semibold text-[var(--text-dark)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="mm-btn-3d mm-btn-3d--sm flex h-7 w-7 items-center justify-center rounded-lg border-none bg-[var(--card-alt)] cursor-pointer"
          >
            <X size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ProgressBar({ ratio, color, trackColor }) {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div
      className="mm-well h-2.5 w-full overflow-hidden rounded-full"
      style={{ background: trackColor || "var(--card-alt)" }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{
          width: `${pct}%`,
          background: color,
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <img
        src={popcat}
        alt="ยังไม่มีข้อมูล"
        className="h-20 w-20 object-contain opacity-80"
      />
      <p className="m-0 text-[13px] font-semibold text-[var(--text-muted)]">
        ยังไม่มีข้อมูลสำหรับ{label}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const C = darkMode ? THEMES.dark : THEMES.light;
  const [alsoSaveFavorite, setAlsoSaveFavorite] = useState(false);
  const themeVars = {
    "--bg": C.bg,
    "--card": C.card,
    "--card-alt": C.cardAlt,
    "--border": C.border,
    "--accent": C.accent,
    "--accent2": C.accent2,
    "--accent-pink": C.accentPink,
    "--accent-contrast": C.accentContrast,
    "--text-dark": C.textDark,
    "--text-muted": C.textMuted,
    "--income": C.income,
    "--income-bg": C.incomeBg,
    "--expense": C.expense,
    "--expense-bg": C.expenseBg,
    "--warn": C.warn,
    "--warn-bg": C.warnBg,
    "--input-bg": C.inputBg,
    "--overlay": C.overlay,
    "--shadow-card": C.shadowCard,
    "--shadow-card-pressed": C.shadowCardPressed,
    "--shadow-balance": C.shadowBalance,
    "--shadow-logo": C.shadowLogo,
    "--shadow-btn": C.shadowBtn,
    "--shadow-btn-pressed": C.shadowBtnPressed,
    "--shadow-well": C.shadowWell,
    "--lit-edge": C.litEdge,
    "--dark-edge": C.darkEdge,
  };

  const [showSplash, setShowSplash] = useState(true);
  const [splashLeaving, setSplashLeaving] = useState(false);
  useEffect(() => {
    const leaveTimer = setTimeout(() => setSplashLeaving(true), 1300);
    const removeTimer = setTimeout(() => setShowSplash(false), 1650);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // ---------- darkMode: preference ของเครื่อง เก็บ localStorage ต่อได้ ----------
  useEffect(() => {
    const saved = localStorage.getItem(DARKMODE_KEY);
    if (saved !== null) setDarkMode(saved === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem(DARKMODE_KEY, String(darkMode));
  }, [darkMode]);

  // ---------- transactions ----------
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  // ---------- profile ----------
  const [profile, setProfile] = useState({
    name: currentUser?.username || "ผู้ใช้งาน",
    email: currentUser?.email || "",
    avatar: currentUser?.avatar || "robocat",
  });
  const [profileForm, setProfileForm] = useState(profile);
  const [profileOpen, setProfileOpen] = useState(false);

  // ---------- ข้อมูลที่เดิมเคยเก็บ localStorage ตอนนี้มาจาก API แล้ว ----------
  const [budgets, setBudgets] = useState({});
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target: "" });
  const [depositingGoalId, setDepositingGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [editingGoalId, setEditingGoalId] = useState(null); // เพิ่มบรรทัดนี้
  const [editGoalDraft, setEditGoalDraft] = useState({ name: "", target: "" });
  const [recurringList, setRecurringList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trendMonthsRange, setTrendMonthsRange] = useState(6);
  const settingsSaveAsFavRef = useRef(false);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(() => {});
    getRecurring()
      .then(setRecurringList)
      .catch(() => {});
    getSettings()
      .then((s) => setBudgets(s.budgets || {}))
      .catch(() => {});
    getSavingsGoals()
      .then(setSavingsGoals)
      .catch(() => {}); // เพิ่มบรรทัดนี้
  }, []);

  // สร้างรายการอัตโนมัติจากรายการเกิดซ้ำ ถ้าเดือนนี้ยังไม่เคยสร้าง
  // หมายเหตุ: ตอนนี้ transaction จากรายการเกิดซ้ำยังเป็น local-only (ไม่ยิง createTransaction)
  // ถ้าอยากให้ยืนยันบันทึกลง DB ด้วย ต้องเปลี่ยนเป็น async + createTransaction ในอนาคต
  useEffect(() => {
    if (recurringList.length === 0) return;

    async function autoAddRecurring() {
      const nowKey = monthKey(new Date());
      for (const r of recurringList) {
        const already = transactions.some(
          (t) => t.recurringId === r.id && monthKey(t.date) === nowKey,
        );
        if (already) continue;

        try {
          const created = await createTransaction({
            type: r.type,
            category: r.category,
            amount: r.amount,
            date: new Date().toISOString().slice(0, 10),
            note: r.note ? `${r.note} (อัตโนมัติ)` : "รายการอัตโนมัติ",
            recurringId: r.id,
          });
          setTransactions((prev) => [created, ...prev]);
        } catch (err) {
          console.error("สร้างรายการอัตโนมัติไม่สำเร็จ:", err);
        }
      }
    }

    autoAddRecurring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringList]);

  const AVATAR_OPTIONS = useMemo(
    () => [
      {
        id: "robocat",
        label: "แมวสุ่ม (RoboHash)",
        src: `https://robohash.org/${encodeURIComponent(profileForm.email || profileForm.name || "meow")}?set=set4`,
      },
    ],
    [profileForm.email, profileForm.name],
  );

  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    category: "ค่าอาหาร",
    amount: "",
    date: "",
    note: "",
  });
  const [formError, setFormError] = useState("");
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipReading, setSlipReading] = useState(false);
  const [slipError, setSlipError] = useState("");
  const [slipLightboxOpen, setSlipLightboxOpen] = useState(false);

  const [quickAddText, setQuickAddText] = useState("");
  const [quickAddType, setQuickAddType] = useState("expense");
  const [selectedFavorite, setSelectedFavorite] = useState(null); // เพิ่มบรรทัดนี้

  function selectFavorite(f) {
    setSelectedFavorite(f);
    setQuickAddText(""); // เคลียร์ข้อความที่พิมพ์ไว้ ถ้ามี
  }
  function clearSelectedFavorite() {
    setSelectedFavorite(null);
  }

  function submitQuickAdd() {
    if (selectedFavorite) {
      addTransactionDirect(selectedFavorite);
      setSelectedFavorite(null);
      setQuickAddText("");
      return;
    }
    const parsed = parseQuickAdd(quickAddText, learnedKeywords); // ← เพิ่ม arg ที่ 2
    if (!parsed) {
      showToast('พิมพ์ชื่อรายการตามด้วยจำนวนเงินนะ เช่น "ข้าว 50"', "error");
      return;
    }
    const category =
      quickAddType === "income"
        ? parsed.type === "income"
          ? parsed.category
          : "อื่นๆ"
        : parsed.type === "expense"
          ? parsed.category
          : "อื่นๆ";
    addTransactionDirect({
      ...parsed,
      type: quickAddType,
      category,
    });
    setQuickAddText("");
  }

  async function addTransactionDirect({ type, category, amount, note }) {
    try {
      const created = await createTransaction({
        type,
        category,
        amount,
        date: new Date().toISOString().slice(0, 10),
        note,
      });
      setTransactions((prev) => [created, ...prev]);
      checkBudgetAfterAdd(created);
      showToast(`เหมียว~ เพิ่ม "${category}" ${formatBaht(amount)} แล้ว`);
    } catch (err) {
      showToast("เพิ่มรายการไม่สำเร็จ", "error");
    }
  }

  const [toast, setToast] = useState(null);
  function showToast(message, type = "success") {
    setToast({ message, type, id: Date.now() });
  }
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const years = [
    ...new Set(transactions.map((t) => new Date(t.date).getFullYear())),
  ].sort((a, b) => b - a);
  const allCategories = [...new Set(transactions.map((t) => t.category))];

  const hasActiveFilters =
    filterType !== "all" ||
    filterCategory !== "all" ||
    filterYear !== "all" ||
    filterMonth !== "all" ||
    searchQuery.trim() !== "";
  function clearFilters() {
    setFilterType("all");
    setFilterCategory("all");
    setFilterYear("all");
    setFilterMonth("all");
    setSearchQuery("");
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions
      .filter((t) => (filterType === "all" ? true : t.type === filterType))
      .filter((t) =>
        filterCategory === "all" ? true : t.category === filterCategory,
      )
      .filter((t) =>
        filterYear === "all"
          ? true
          : new Date(t.date).getFullYear() === Number(filterYear),
      )
      .filter((t) =>
        filterMonth === "all"
          ? true
          : new Date(t.date).getMonth() + 1 === Number(filterMonth),
      )
      .filter((t) =>
        q === ""
          ? true
          : t.category.toLowerCase().includes(q) ||
            (t.note || "").toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        // วันที่เท่ากัน ใช้ createdAt เป็นตัวตัดสิน (ล่าสุดอยู่บน)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [
    transactions,
    filterType,
    filterCategory,
    filterYear,
    filterMonth,
    searchQuery,
  ]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const overallTotals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const monthlySummary = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const key = monthKey(t.date);
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      map[key][t.type] += t.amount;
    });
    return Object.entries(map)
      .map(([key, v]) => ({ key, ...v, balance: v.income - v.expense }))
      .sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [transactions]);

  const monthCompare = useMemo(() => {
    if (monthlySummary.length < 1) return null;
    const current = monthlySummary[0];
    const previous = monthlySummary[1];
    if (!previous) return { current, previous: null, expenseDiffPct: null };
    const expenseDiffPct =
      previous.expense === 0
        ? null
        : ((current.expense - previous.expense) / previous.expense) * 100;
    return { current, previous, expenseDiffPct };
  }, [monthlySummary]);

  const pieData = useMemo(() => {
    const map = {};
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const trendData = useMemo(() => {
    const sliced =
      trendMonthsRange === "all"
        ? [...monthlySummary]
        : [...monthlySummary].slice(0, trendMonthsRange);
    return sliced.reverse().map((m) => ({
      key: m.key,
      month: monthShortLabel(m.key),
      รายรับ: m.income,
      รายจ่าย: m.expense,
    }));
  }, [monthlySummary, trendMonthsRange]);

  // เพิ่ม useMemo นี้ (วางแถวเดียวกับ pieData, trendData)
  const learnedKeywords = useMemo(
    () => buildLearnedKeywords(transactions),
    [transactions],
  );

  const catStatus = useMemo(() => {
    const asc = [...monthlySummary].sort((a, b) => (a.key < b.key ? -1 : 1));
    let streak = 0;
    for (let i = asc.length - 1; i >= 0; i--) {
      if (asc[i].balance > 0) streak++;
      else break;
    }
    let level, label, message, color;
    if (asc.length === 0) {
      level = 1;
      label = "แมวปกติ";
      message = "เหมียว~ เริ่มบันทึกรายรับรายจ่ายกันเลย";
      color = "var(--text-muted)";
    } else if (streak === 0) {
      level = 0;
      label = "แมวหิว";
      message = "เหมียวว... เดือนนี้ใช้เงินเกินรายรับ ลองลดรายจ่ายดูนะ";
      color = "var(--expense)";
    } else if (streak <= 1) {
      level = 1;
      label = "แมวปกติ";
      message = "เหมียว~ เดือนนี้ยอดเป็นบวกแล้ว ไปต่อกันเถอะ";
      color = "var(--text-dark)";
    } else if (streak <= 3) {
      level = 2;
      label = "แมวอิ่มใจ";
      message = `เหมียว! ออมได้ต่อเนื่อง ${streak} เดือนแล้วนะ เก่งมาก`;
      color = "var(--income)";
    } else {
      level = 3;
      label = "แมวอ้วนพี มีความสุข";
      message = `เพอร์ร~ ออมต่อเนื่องมา ${streak} เดือน แมวอ้วนขึ้นทุกวัน!`;
      color = "var(--income)";
    }
    return { streak, level, label, message, color };
  }, [monthlySummary]);

  const catSize = 56 + catStatus.level * 14;

  function checkBudgetAfterAdd(tx) {
    if (tx.type !== "expense") return;
    const budget = budgets[tx.category];
    if (!budget || budget.amount <= 0) return;

    const period = budget.period === "weekly" ? "weekly" : "monthly";
    const nowKey =
      period === "weekly" ? weekKey(new Date()) : monthKey(new Date());
    const keyFn = period === "weekly" ? weekKey : monthKey;

    const spentThisPeriod =
      transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === tx.category &&
            keyFn(t.date) === nowKey,
        )
        .reduce((s, t) => s + t.amount, 0) + tx.amount;

    const periodLabel = period === "weekly" ? "สัปดาห์นี้" : "เดือนนี้";

    if (spentThisPeriod > budget.amount) {
      setTimeout(
        () =>
          showToast(
            `เหมียว! หมวด "${tx.category}" ใช้เกินงบ${periodLabel}แล้ว (${formatBaht(spentThisPeriod)}/${formatBaht(budget.amount)})`,
            "error",
          ),
        3300,
      );
    } else if (spentThisPeriod >= budget.amount * 0.8) {
      setTimeout(
        () =>
          showToast(
            `เหมียว~ หมวด "${tx.category}" ใกล้เต็มงบ${periodLabel}แล้วนะ (${formatBaht(spentThisPeriod)}/${formatBaht(budget.amount)})`,
          ),
        3300,
      );
    }
  }

  const budgetProgress = useMemo(() => {
    const nowMonthKey = monthKey(new Date());
    const nowWeekKey = weekKey(new Date());

    return Object.entries(budgets)
      .filter(([, b]) => b && b.amount > 0)
      .map(([category, b]) => {
        const period = b.period === "weekly" ? "weekly" : "monthly";
        const spent = transactions
          .filter((t) => {
            if (t.type !== "expense" || t.category !== category) return false;
            return period === "weekly"
              ? weekKey(t.date) === nowWeekKey
              : monthKey(t.date) === nowMonthKey;
          })
          .reduce((s, t) => s + t.amount, 0);
        return {
          category,
          amount: b.amount,
          period,
          spent,
          ratio: spent / b.amount,
        };
      });
  }, [budgets, transactions]);

  // const totalBalanceAllTime = useMemo(
  //   () =>
  //     transactions.reduce(
  //       (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
  //       0,
  //     ),
  //   [transactions],
  // );
  // const savingsRatio =
  //   savingsGoal.target > 0
  //     ? Math.max(0, totalBalanceAllTime) / savingsGoal.target
  //     : 0;

  const savingsTotals = useMemo(() => {
    const totalSaved = savingsGoals.reduce((s, g) => s + g.saved, 0);
    const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
    return { totalSaved, totalTarget };
  }, [savingsGoals]);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudgetCategory, setEditingBudgetCategory] = useState(null);
  const [editBudgetDraft, setEditBudgetDraft] = useState({
    amount: "",
    period: "monthly",
  });
  const [newBudget, setNewBudget] = useState({
    category: CATEGORY_OPTIONS.expense[0],
    amount: "",
    period: "monthly",
  });

  async function addBudget() {
    if (!newBudget.amount || Number(newBudget.amount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินให้ถูกต้อง", "error");
      return;
    }
    const updated = {
      ...budgets,
      [newBudget.category]: {
        amount: Number(newBudget.amount),
        period: newBudget.period,
      },
    };
    try {
      await updateSettings({ budgets: updated });
      setBudgets(updated);
      setNewBudget({
        category: CATEGORY_OPTIONS.expense[0],
        amount: "",
        period: "monthly",
      });
      showToast("เพิ่มงบประมาณแล้ว");
    } catch (err) {
      showToast("เพิ่มงบประมาณไม่สำเร็จ", "error");
    }
  }

  async function submitEditBudget(category) {
    if (!editBudgetDraft.amount || Number(editBudgetDraft.amount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินให้ถูกต้อง", "error");
      return;
    }
    const updated = {
      ...budgets,
      [category]: {
        amount: Number(editBudgetDraft.amount),
        period: editBudgetDraft.period,
      },
    };
    try {
      await updateSettings({ budgets: updated });
      setBudgets(updated);
      setEditingBudgetCategory(null);
      showToast("แก้ไขงบประมาณแล้ว");
    } catch (err) {
      showToast("แก้ไขงบประมาณไม่สำเร็จ", "error");
    }
  }

  async function removeBudget(category) {
    const updated = { ...budgets };
    delete updated[category];
    try {
      await updateSettings({ budgets: updated });
      setBudgets(updated);
      showToast("ลบงบประมาณแล้ว", "error");
    } catch (err) {
      showToast("ลบงบประมาณไม่สำเร็จ", "error");
    }
  }

  function preprocessImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;

        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const value = gray > 150 ? 255 : gray < 90 ? 0 : gray;
          d[i] = d[i + 1] = d[i + 2] = value;
        }
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => resolve(blob), "image/png");
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleSlipUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipError("");
    setSlipPreview(URL.createObjectURL(file));
    setSlipReading(true);

    try {
      const processedBlob = await preprocessImage(file);

      const { data } = await Tesseract.recognize(processedBlob, "eng", {
        tessedit_char_whitelist:
          "0123456789.,/-: กจำนวนเงินบาทค่าธรรมเนียมวันที่ทำรายการ",
      });

      const text = data.text;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      let bestAmount = null;
      const amountLineIndex = lines.findIndex(
        (l) => l.includes("จำนวนเงิน") || /amount/i.test(l),
      );
      if (amountLineIndex !== -1) {
        const searchLines = [
          lines[amountLineIndex],
          lines[amountLineIndex + 1] || "",
        ];
        for (const line of searchLines) {
          const m = line.match(/[\d,]+\.\d{2}/);
          if (m) {
            bestAmount = parseFloat(m[0].replace(/,/g, ""));
            break;
          }
        }
      }

      if (!bestAmount) {
        const filteredLines = lines.filter(
          (l) => !l.includes("ค่าธรรมเนียม") && !/fee/i.test(l),
        );
        const allMatches = filteredLines.join(" ").match(/[\d,]+\.\d{2}/g);
        if (allMatches) {
          const numbers = allMatches
            .map((m) => parseFloat(m.replace(/,/g, "")))
            .filter((n) => n > 0);
          if (numbers.length > 0) bestAmount = Math.max(...numbers);
        }
      }

      const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      let guessedDate = null;
      if (dateMatch) {
        const [, d, m, y] = dateMatch;
        let year = y.length === 2 ? `20${y}` : y;
        if (parseInt(year) > 2500) year = String(parseInt(year) - 543);
        guessedDate = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }

      if (!bestAmount) {
        setSlipError("อ่านยอดเงินจากสลิปไม่ได้ กรุณากรอกเอง");
      } else {
        setForm((f) => ({
          ...f,
          amount: String(bestAmount),
          date: guessedDate || f.date,
        }));
        setSlipError("⚠️ กรุณาตรวจสอบยอดเงินที่อ่านได้ให้ถูกต้องก่อนบันทึก");
      }
    } catch (err) {
      console.error("OCR error:", err);
      setSlipError("เกิดข้อผิดพลาดในการอ่านสลิป กรุณากรอกยอดเงินเอง");
    } finally {
      setSlipReading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setForm({
      type: "income", // เปลี่ยนจาก "expense"
      category: "เงินเดือน", // เปลี่ยนจาก "ค่าอาหาร" ให้ตรงกับ type ใหม่
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setFormError("");
    setSlipPreview(null);
    setSlipError("");
    setSlipLightboxOpen(false);
    settingsSaveAsFavRef.current = false;
    setFormOpen(true);
  }
  function openEditForm(t) {
    setHistoryModalOpen(false);
    setEditingId(t.id);
    setForm({
      type: t.type,
      category: t.category,
      amount: String(t.amount),
      date: t.date,
      note: t.note,
    });
    setFormError("");
    setSlipPreview(null);
    setSlipError("");
    setSlipLightboxOpen(false);
    setFormOpen(true);
  }

  async function submitForm(saveAsFavorite) {
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (!form.date) {
      setFormError("กรุณาเลือกวันที่");
      return;
    }

    try {
      if (editingId) {
        const updated = await updateTransaction(editingId, form);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t)),
        );
        showToast("แก้ไขรายการเรียบร้อยแล้ว");
      } else {
        const created = await createTransaction(form);
        setTransactions((prev) => [created, ...prev]);
        checkBudgetAfterAdd(created);
        showToast("เพิ่มรายการเรียบร้อยแล้ว");

        // บันทึกเป็นรายการโปรดใน DB จริง (เฉพาะตอนเพิ่มรายการใหม่ ไม่ใช่ตอนแก้ไข)
        if (saveAsFavorite) {
          try {
            const fav = await createFavorite({
              label: form.note || form.category,
              type: form.type,
              category: form.category,
              amount: Number(form.amount),
              note: form.note || form.category,
            });
            setFavorites((prev) => [...prev, fav]);
          } catch (err) {
            showToast("บันทึกรายการโปรดไม่สำเร็จ", "error");
          }
        }
      }
      setFormOpen(false);
      setHistoryModalOpen(true);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "บันทึกไม่สำเร็จ กรุณาลองใหม่",
      );
    }
  }

  async function confirmDelete() {
    try {
      await deleteTransaction(deleteTarget.id);
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      showToast("ลบรายการเรียบร้อยแล้ว", "error");
    } catch (err) {
      showToast("ลบไม่สำเร็จ กรุณาลองใหม่", "error");
    }
    setDeleteTarget(null);
    setHistoryModalOpen(true);
  }

  async function saveProfile() {
    try {
      const updated = await updateProfile(profileForm);
      setProfile(updated);
      setProfileOpen(false);
    } catch (err) {
      showToast("บันทึกโปรไฟล์ไม่สำเร็จ", "error");
    }
  }

  function exportCSV() {
    const header = ["วันที่", "ประเภท", "หมวดหมู่", "จำนวนเงิน", "รายละเอียด"];
    const rows = filtered.map((t) => [
      t.date,
      t.type === "income" ? "รายรับ" : "รายจ่าย",
      t.category,
      t.amount,
      (t.note || "").replace(/[\r\n,]+/g, " "),
    ]);
    const csvContent = [header, ...rows]
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meowmoney-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("ดาวน์โหลด CSV แล้ว");
  }

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pieModalOpen, setPieModalOpen] = useState(false);
  const [monthlySummaryModalOpen, setMonthlySummaryModalOpen] = useState(false);
  const [incomeExpenseModalOpen, setIncomeExpenseModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState({});
  // const [goalDraft, setGoalDraft] = useState(savingsGoal);
  const [newRecurring, setNewRecurring] = useState({
    type: "expense",
    category: "ค่าที่พัก",
    amount: "",
    note: "",
  });
  function openSettings() {
    const draft = {};
    CATEGORY_OPTIONS.expense.forEach((cat) => {
      const existing = budgets[cat];
      draft[cat] = {
        amount: existing?.amount ?? "",
        period: existing?.period ?? "monthly",
      };
    });
    setBudgetDraft(draft);
    setSettingsOpen(true);
  }

  function saveSettings() {
    const cleaned = {};
    Object.entries(budgetDraft).forEach(([k, v]) => {
      if (Number(v.amount) > 0) {
        cleaned[k] = { amount: Number(v.amount), period: v.period };
      }
    });

    updateSettings({ budgets: cleaned })
      .then(() => {
        setBudgets(cleaned);
        setSettingsOpen(false);
        showToast("บันทึกการตั้งค่าแล้ว");
      })
      .catch(() => showToast("บันทึกการตั้งค่าไม่สำเร็จ", "error"));
  }

  async function addRecurring() {
    if (!newRecurring.amount || Number(newRecurring.amount) <= 0) return;
    try {
      const item = await createRecurring({
        ...newRecurring,
        amount: Number(newRecurring.amount),
      });
      setRecurringList((prev) => [...prev, item]);

      if (alsoSaveFavorite) {
        try {
          const fav = await createFavorite({
            label: newRecurring.note || newRecurring.category,
            type: newRecurring.type,
            category: newRecurring.category,
            amount: Number(newRecurring.amount),
            note: newRecurring.note || newRecurring.category,
          });
          setFavorites((prev) => [...prev, fav]);
        } catch (err) {
          showToast("บันทึกรายการโปรดไม่สำเร็จ", "error");
        }
      }

      setNewRecurring({
        type: "expense",
        category: "ค่าที่พัก",
        amount: "",
        note: "",
      });
      setAlsoSaveFavorite(false);
    } catch (err) {
      showToast("เพิ่มรายการเกิดซ้ำไม่สำเร็จ", "error");
    }
  }

  async function removeRecurring(id) {
    try {
      await deleteRecurring(id);
      setRecurringList((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      showToast("ลบรายการเกิดซ้ำไม่สำเร็จ", "error");
    }
  }

  async function addSavingsGoal() {
    if (
      !newGoal.name.trim() ||
      !newGoal.target ||
      Number(newGoal.target) <= 0
    ) {
      showToast("กรุณากรอกชื่อและจำนวนเงินเป้าหมายให้ถูกต้อง", "error");
      return;
    }
    try {
      const goal = await createSavingsGoal({
        name: newGoal.name.trim(),
        target: Number(newGoal.target),
      });
      setSavingsGoals((prev) => [...prev, goal]);
      setNewGoal({ name: "", target: "" });
    } catch (err) {
      showToast("เพิ่มเป้าหมายไม่สำเร็จ", "error");
    }
  }

  async function submitEditGoal(goalId) {
    if (
      !editGoalDraft.name.trim() ||
      !editGoalDraft.target ||
      Number(editGoalDraft.target) <= 0
    ) {
      showToast("กรุณากรอกชื่อและจำนวนเงินเป้าหมายให้ถูกต้อง", "error");
      return;
    }
    try {
      const updated = await updateSavingsGoal(goalId, {
        name: editGoalDraft.name.trim(),
        target: Number(editGoalDraft.target),
      });
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, ...updated } : g)),
      );
      setEditingGoalId(null);
      showToast("แก้ไขเป้าหมายแล้ว");
    } catch (err) {
      showToast("แก้ไขเป้าหมายไม่สำเร็จ", "error");
    }
  }

  async function removeSavingsGoal(id) {
    try {
      const deletedTransactionIds = await deleteSavingsGoal(id);
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
      if (deletedTransactionIds.length > 0) {
        setTransactions((prev) =>
          prev.filter((t) => !deletedTransactionIds.includes(t.id)),
        );
      }
      showToast("ลบเป้าหมายแล้ว คืนเงินกลับเข้ายอดคงเหลือ");
    } catch (err) {
      showToast("ลบเป้าหมายไม่สำเร็จ", "error");
    }
  }

  async function submitDeposit(goalId) {
    if (!depositAmount || Number(depositAmount) <= 0) {
      showToast("กรุณากรอกจำนวนเงินให้ถูกต้อง", "error");
      return;
    }
    try {
      const { goal, transaction } = await depositToSavingsGoal(
        goalId,
        Number(depositAmount),
      );
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, saved: goal.saved } : g)),
      );
      setTransactions((prev) => [transaction, ...prev]);
      setDepositingGoalId(null);
      setDepositAmount("");
      showToast(`เติมเงินเข้าเป้าหมาย "${goal.name}" แล้ว`);
    } catch (err) {
      // แสดง error message จาก backend แทนข้อความ generic เดิม
      // เพื่อบอกผู้ใช้ชัดๆ ว่าคงเหลือไม่พอเท่าไหร่
      const message = err.response?.data?.message || "เติมเงินไม่สำเร็จ";
      showToast(message, "error");
    }
  }

  async function removeFavorite(id) {
    try {
      await deleteFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      showToast("ลบรายการโปรดไม่สำเร็จ", "error");
    }
  }

  const selectCls =
    "mm-well h-[34px] rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-2.5 text-[13px] text-[var(--text-dark)]";
  const iconBtnCls =
    "mm-btn-3d mm-btn-3d--sm flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-none bg-[var(--card-alt)] cursor-pointer";
  const labelCls =
    "mb-[5px] block text-xs font-semibold text-[var(--text-muted)]";
  const inputCls =
    "mm-well box-border h-[38px] w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-dark)]";

  const navigate = useNavigate();
  function handleLogout() {
    setLogoutConfirmOpen(true);
  }
  function confirmLogout() {
    logout();
    navigate("/login");
  }

  // เรียกครั้งเดียวตอน mount หลัง transactions โหลดเสร็จ
  // backend เป็นคนตัดสินว่าต้องสร้างให้ recurring ตัวไหนบ้าง กันปัญหาสร้างซ้ำ/สร้างผิดเดือน
  const generatedRef = useRef(false);
  useEffect(() => {
    if (generatedRef.current) return; // กัน effect รันซ้ำจาก StrictMode
    generatedRef.current = true;

    generateDueTransactions()
      .then((created) => {
        if (created.length > 0) {
          setTransactions((prev) => [...created, ...prev]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={themeVars}
      className="relative flex min-h-screen w-full flex-col bg-[var(--bg)] transition-colors duration-300"
    >
      <style>{`
        .mm-splash { animation: mm-splash-fadein 0.25s ease; }
        .mm-splash-out { animation: mm-splash-fadeout 0.35s ease forwards; }
        .mm-splash-logo { animation: mm-splash-pop 0.6s cubic-bezier(.34,1.56,.64,1); }
        @keyframes mm-splash-fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mm-splash-fadeout { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }
        @keyframes mm-splash-pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
        .mm-splash-dots span { width: 8px; height: 8px; border-radius: 50%; background: currentColor; display: inline-block; animation: mm-splash-bounce 1s infinite ease-in-out; }
        .mm-splash-dots span:nth-child(2) { animation-delay: 0.15s; }
        .mm-splash-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes mm-splash-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
        .mm-toast { animation: mm-toast-in 0.25s ease, mm-toast-out 0.3s ease 2.9s forwards; }
        @keyframes mm-toast-in { from { opacity: 0; transform: translateY(-10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes mm-toast-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(0.96); } }
        .mm-toast-bar { animation: mm-toast-shrink 3.2s linear forwards; transform-origin: left; }
        @keyframes mm-toast-shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        .mm-cat-bounce { animation: mm-cat-bounce 2.4s ease-in-out infinite; }
        @keyframes mm-cat-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        /* ---------- 3D depth system ----------
           Two-tone shadow (light source top-left) makes flat cards read as
           physically raised tiles. Pressed / well variants sink inward so
           inputs and progress tracks read as carved rather than painted-on. */
        .mm-surface {
          box-shadow: var(--shadow-card);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .mm-surface--interactive:hover {
          transform: translateY(-3px);
        }
        .mm-surface--interactive:active {
          transform: translateY(-1px);
          box-shadow: var(--shadow-card-pressed);
        }
        .mm-surface--balance {
          box-shadow: var(--shadow-balance);
        }
        .mm-well {
          box-shadow: var(--shadow-well);
        }
        .mm-icon-well {
          box-shadow: var(--shadow-well);
        }
        .mm-btn-3d {
          box-shadow: var(--shadow-btn);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .mm-btn-3d:active {
          transform: translateY(2px);
          box-shadow: var(--shadow-btn-pressed);
        }
        .mm-btn-3d--sm:active {
          transform: translateY(1px);
        }
        .mm-btn-primary {
          box-shadow: var(--shadow-btn), inset 0 1px 0 rgba(255,255,255,0.35);
        }
        .mm-btn-primary:active {
          box-shadow: var(--shadow-btn-pressed);
        }
        .mm-edge-top {
          position: relative;
        }
        .mm-edge-top::before {
          content: "";
          position: absolute;
          top: 0;
          left: 14px;
          right: 14px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--lit-edge), transparent);
          border-radius: 999px;
        }
        .mm-chip {
          box-shadow: var(--shadow-btn);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .mm-chip:active {
          transform: translateY(1px) scale(0.98);
          box-shadow: var(--shadow-btn-pressed);
        }
      `}</style>

      {showSplash && (
        <div
          className={`mm-splash${splashLeaving ? " mm-splash-out" : ""} fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--bg)]`}
        >
          <img
            src={logoMeowMoney}
            alt="MeowMoney"
            className="mm-splash-logo h-[220px] w-[220px] object-contain"
            style={{ filter: "drop-shadow(0 18px 30px rgba(108,92,231,0.35))" }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logoMeowMoney}
                alt="MeowMoney"
                className="mm-btn-3d h-12 w-12 shrink-0 rounded-xl object-contain"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={openSettings}
                aria-label="ตั้งค่า"
                title="งบประมาณ / เป้าหมายออม / รายการเกิดซ้ำ"
                className="mm-btn-3d flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-alt)] cursor-pointer"
              >
                <Settings size={15} className="text-[var(--text-dark)]" />
              </button>
              <button
                onClick={() => setDarkMode((d) => !d)}
                aria-label={darkMode ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
                className="mm-btn-3d flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-alt)] cursor-pointer"
              >
                {darkMode ? (
                  <Sun size={15} className="text-[var(--text-dark)]" />
                ) : (
                  <Moon size={15} className="text-[var(--text-dark)]" />
                )}
              </button>
              <button
                onClick={handleLogout}
                aria-label="ออกจากระบบ"
                title="ออกจากระบบ"
                className="mm-btn-3d flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-alt)] cursor-pointer"
              >
                <LogOut size={15} className="text-[var(--text-dark)]" />
              </button>
              <button
                onClick={() => {
                  setProfileForm(profile);
                  setProfileOpen(true);
                }}
                className="flex items-center gap-2 rounded-[20px] border-none bg-transparent py-1 pl-1 pr-2 cursor-pointer"
              >
                <div className="mm-icon-well flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--card-alt)] text-xs font-bold text-[var(--text-dark)]">
                  {(() => {
                    const avatarSrc =
                      AVATAR_OPTIONS.find((a) => a.id === profile.avatar)
                        ?.src || AVATAR_OPTIONS[0].src;
                    return (
                      <img
                        src={avatarSrc}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    );
                  })()}
                </div>
                <span className="text-[13px] font-medium text-[var(--text-dark)]">
                  {profile.name}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[920px] p-4 sm:p-6">
          {/* Hero header */}
          <div className="relative mb-6 flex items-start justify-between gap-3 py-1">
            <div className="min-w-0 flex-1">
              <p className="m-0 mb-1 text-xs font-semibold text-[var(--text-muted)]">
                สวัสดี {profile.name}
              </p>
              <h2 className="m-0 text-[22px] font-extrabold leading-tight text-[var(--text-dark)] sm:text-3xl">
                จัดการเงินของคุณกับ{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-pink) 100%)",
                  }}
                >
                  MeowMoney
                </span>
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* <button
                onClick={exportCSV}
                aria-label="ส่งออก CSV"
                title="ส่งออกเป็น CSV"
                className="mm-btn-3d flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-[13px] font-semibold text-[var(--text-dark)] cursor-pointer sm:h-[38px] sm:w-auto sm:px-4"
              >
                <Download size={16} className="sm:hidden" />
                <Download size={14} className="hidden sm:block" />
                <span className="hidden sm:inline">CSV</span>
              </button> */}
              <button
                onClick={openAddForm}
                aria-label="เพิ่มรายการ"
                className="mm-btn-3d mm-btn-primary flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-full border-none text-xs font-semibold text-white cursor-pointer sm:h-8 sm:w-auto sm:px-3"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--accent) 0%, var(--accent-pink) 100%)",
                }}
              >
                <Plus size={15} className="sm:hidden" />
                <Plus size={13} className="hidden sm:block" />
                <span className="hidden sm:inline">เพิ่มรายการ</span>
              </button>
            </div>
          </div>

          {/* Quick add */}
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
            <Sparkles size={11} className="text-[var(--accent)]" />
            เพิ่มไวด้วยข้อความ · เลือกประเภท พิมพ์ชื่อรายการตามด้วยจำนวนเงิน
          </div>
          <div className="mb-2.5 flex gap-2">
            {/* ปุ่มสลับรายรับ/รายจ่าย */}
            <div className="mm-well flex shrink-0 items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--input-bg)] p-1">
              <button
                type="button"
                onClick={() => setQuickAddType("income")}
                className="rounded-full border-none px-2.5 py-1.5 text-[11px] font-bold cursor-pointer transition-colors"
                style={{
                  background:
                    quickAddType === "income" ? "var(--income)" : "transparent",
                  color:
                    quickAddType === "income" ? "#ffffff" : "var(--text-muted)",
                }}
              >
                รายรับ
              </button>
              <button
                type="button"
                onClick={() => setQuickAddType("expense")}
                className="rounded-full border-none px-2.5 py-1.5 text-[11px] font-bold cursor-pointer transition-colors"
                style={{
                  background:
                    quickAddType === "expense"
                      ? "var(--expense)"
                      : "transparent",
                  color:
                    quickAddType === "expense"
                      ? "#ffffff"
                      : "var(--text-muted)",
                }}
              >
                รายจ่าย
              </button>
            </div>

            <div
              className={`${inputCls} flex flex-1 items-center gap-2 rounded-full px-4`}
            >
              {selectedFavorite ? (
                <>
                  <Star
                    size={13}
                    className="shrink-0 text-[var(--accent-pink)]"
                  />
                  <span className="flex-1 truncate text-sm text-[var(--text-dark)]">
                    {selectedFavorite.label} ·{" "}
                    {formatBaht(selectedFavorite.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={clearSelectedFavorite}
                    aria-label="ยกเลิกการเลือกรายการโปรด"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--card-alt)] cursor-pointer"
                  >
                    <X size={11} className="text-[var(--text-muted)]" />
                  </button>
                </>
              ) : (
                <input
                  type="text"
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitQuickAdd()}
                  placeholder="เช่น ข้าว 50"
                  className="h-full w-full border-none bg-transparent text-sm text-[var(--text-dark)] outline-none"
                />
              )}
            </div>
            <button
              onClick={submitQuickAdd}
              className="mm-btn-3d mm-btn-primary shrink-0 rounded-full border-none bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-contrast)] cursor-pointer"
            >
              เพิ่ม
            </button>
          </div>

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--text-muted)]">
                <Star size={11} className="text-[var(--accent-pink)]" />
                รายการโปรด · แตะเพื่อเพิ่มไว
              </div>
              <div className="flex flex-wrap gap-1.5">
                {favorites.map((f) => (
                  <div
                    key={f.id}
                    className="mm-chip flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] py-1.5 pl-3 pr-1.5 text-xs font-semibold text-[var(--text-dark)]"
                  >
                    <button
                      type="button"
                      onClick={() => selectFavorite(f)}
                      className="flex items-center gap-1.5 border-none bg-transparent p-0 cursor-pointer"
                    >
                      <Star size={11} className="text-[var(--accent-pink)]" />
                      {f.label} · {formatBaht(f.amount)}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(f.id);
                      }}
                      aria-label="ลบรายการโปรด"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--card-alt)] cursor-pointer"
                    >
                      <X size={9} className="text-[var(--text-muted)]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary: คงเหลือ + สถานะน้องแมว */}
          <div className="mb-5">
            <div
              className="mm-surface mm-surface--interactive mm-surface--balance relative overflow-hidden rounded-[24px] p-5 sm:p-6"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent-pink) 100%)",
              }}
            >
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.22]">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <div className="mb-1 text-xs font-semibold text-white opacity-85">
                    คงเหลือ
                  </div>
                  <div className="text-[32px] font-extrabold tracking-[-0.3px] text-white">
                    {formatBaht(overallTotals.balance)}
                  </div>
                </div>

                {/* น้องแมว */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <div className="mm-cat-bounce">
                    <img
                      src={
                        catStatus.level === 0
                          ? catSad
                          : catStatus.level >= 2
                            ? catStreak
                            : catNormal
                      }
                      alt={catStatus.label}
                      style={{
                        width: 84 + catStatus.level * 10,
                        height: 84 + catStatus.level * 10,
                      }}
                      className="rounded-full border-[3px] border-white/60 object-cover shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    />
                  </div>
                  <span className="rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white">
                    {catStatus.label}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-3 rounded-xl bg-white/15 px-3 py-2 text-[11px] leading-snug text-white">
                {catStatus.message}
              </div>
            </div>
          </div>

          {/* เดือนนี้เทียบเดือนที่แล้ว */}
          {monthCompare && monthCompare.previous && (
            <div className="mm-surface mb-5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[13px] text-[var(--text-dark)]">
              {monthCompare.expenseDiffPct === null ? (
                <span>
                  {monthLabel(monthCompare.current.key)}: รายจ่าย{" "}
                  {formatBaht(monthCompare.current.expense)}
                </span>
              ) : monthCompare.expenseDiffPct > 0 ? (
                <span>
                  📈 {monthLabel(monthCompare.current.key)} ใช้จ่ายมากกว่า{" "}
                  {monthLabel(monthCompare.previous.key)} อยู่{" "}
                  <b className="text-[var(--expense)]">
                    {monthCompare.expenseDiffPct.toFixed(0)}%
                  </b>
                </span>
              ) : (
                <span>
                  📉 {monthLabel(monthCompare.current.key)} ใช้จ่ายน้อยกว่า{" "}
                  {monthLabel(monthCompare.previous.key)} อยู่{" "}
                  <b className="text-[var(--income)]">
                    {Math.abs(monthCompare.expenseDiffPct).toFixed(0)}%
                  </b>{" "}
                  เยี่ยมมาก!
                </span>
              )}
            </div>
          )}

          {/* เป้าหมายออม + งบประมาณ */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="mm-surface rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                <Target size={13} /> เป้าหมายออม
              </div>
              {savingsGoals.length > 0 ? (
                <button
                  onClick={() => setSavingsModalOpen(true)}
                  className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
                >
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold text-[var(--text-dark)]">
                      {savingsGoals.length} เป้าหมาย
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {savingsTotals.totalTarget > 0
                        ? Math.round(
                            (savingsTotals.totalSaved /
                              savingsTotals.totalTarget) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <ProgressBar
                    ratio={
                      savingsTotals.totalTarget > 0
                        ? savingsTotals.totalSaved / savingsTotals.totalTarget
                        : 0
                    }
                    color="var(--income)"
                  />
                  <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {formatBaht(savingsTotals.totalSaved)} /{" "}
                    {formatBaht(savingsTotals.totalTarget)}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setSavingsModalOpen(true)}
                  className="text-[12px] font-semibold text-[var(--accent)] underline cursor-pointer bg-transparent border-none p-0"
                >
                  + ตั้งเป้าหมายออมเงิน
                </button>
              )}
            </div>

            <div className="mm-surface rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                <PiggyBank size={13} /> งบประมาณ
              </div>
              {budgetProgress.length > 0 ? (
                <button
                  onClick={() => setBudgetModalOpen(true)}
                  className="flex w-full flex-col gap-2 border-none bg-transparent p-0 text-left cursor-pointer"
                >
                  {budgetProgress.map((b) => (
                    <div key={b.category}>
                      <div className="mb-1 flex items-baseline justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-semibold text-[var(--text-dark)]">
                          {b.category}
                          <span className="rounded-full bg-[var(--card-alt)] px-1.5 py-[1px] text-[9px] font-medium text-[var(--text-muted)]">
                            {b.period === "weekly" ? "สัปดาห์" : "เดือน"}
                          </span>
                        </span>
                        <span className="text-[var(--text-muted)]">
                          {formatBaht(b.spent)}/{formatBaht(b.amount)}
                        </span>
                      </div>
                      <ProgressBar
                        ratio={b.ratio}
                        color={
                          b.ratio >= 1
                            ? "var(--expense)"
                            : b.ratio >= 0.8
                              ? "var(--warn)"
                              : "var(--income)"
                        }
                      />
                    </div>
                  ))}
                </button>
              ) : (
                <button
                  onClick={() => setBudgetModalOpen(true)}
                  className="text-[12px] font-semibold text-[var(--accent)] underline cursor-pointer bg-transparent border-none p-0"
                >
                  + ตั้งงบประมาณรายหมวดหมู่
                </button>
              )}
            </div>
          </div>

          {/* แถวไอคอน: รายรับ-รายจ่าย / ประวัติ / สัดส่วนรายจ่าย / สรุปยอดรายเดือน */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <button
              onClick={() => setIncomeExpenseModalOpen(true)}
              className="mm-surface mm-surface--interactive flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 py-3.5 text-center cursor-pointer sm:py-4"
            >
              <div className="mm-icon-well flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-alt)]">
                <Wallet size={17} className="text-[var(--accent)]" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-[var(--text-dark)] sm:text-xs">
                รายรับ-รายจ่าย
              </span>
            </button>

            <button
              onClick={() => setHistoryModalOpen(true)}
              className="mm-surface mm-surface--interactive flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 py-3.5 text-center cursor-pointer sm:py-4"
            >
              <div className="mm-icon-well flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-alt)]">
                <Search size={17} className="text-[var(--accent)]" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-[var(--text-dark)] sm:text-xs">
                ประวัติการทำรายการ
              </span>
            </button>

            <button
              onClick={() => setPieModalOpen(true)}
              className="mm-surface mm-surface--interactive flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 py-3.5 text-center cursor-pointer sm:py-4"
            >
              <div className="mm-icon-well flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-alt)]">
                <PiggyBank size={17} className="text-[var(--accent)]" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-[var(--text-dark)] sm:text-xs">
                สัดส่วนรายจ่าย
              </span>
            </button>

            <button
              onClick={() => setMonthlySummaryModalOpen(true)}
              className="mm-surface mm-surface--interactive flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-2 py-3.5 text-center cursor-pointer sm:py-4"
            >
              <div className="mm-icon-well flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card-alt)]">
                <Repeat size={17} className="text-[var(--accent)]" />
              </div>
              <span className="text-[11px] font-bold leading-tight text-[var(--text-dark)] sm:text-xs">
                สรุปยอดรายเดือน
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--border)] px-6 py-5 text-center">
        <img
          src="https://media.tenor.com/wWYDcbdOMWQAAAAd/cat-kiss-kiss-cat.gif"
          alt="Cute Kissing Cat"
          className="mm-icon-well mx-auto mb-2.5 block h-[90px] w-[90px] rounded-full object-cover"
        />

        <div className="mb-1.5 flex items-center justify-center gap-2" />

        <p className="m-0 text-sm text-[var(--text-muted)]">
          © 2026 Dullapah Taweesaengsiri. All Rights Reserved.
        </p>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
      >
        <div className="mb-3.5 flex gap-2">
          {["income", "expense"].map((ty) => (
            <button
              key={ty}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  type: ty,
                  category: CATEGORY_OPTIONS[ty][0],
                }))
              }
              className={`flex-1 rounded-lg py-2.5 text-[13px] font-semibold cursor-pointer ${form.type === ty ? "mm-btn-3d mm-btn-primary" : "mm-well"}`}
              style={{
                border: `1px solid ${form.type === ty ? "var(--accent)" : "var(--border)"}`,
                background: form.type === ty ? "var(--accent)" : "var(--card)",
                color:
                  form.type === ty
                    ? "var(--accent-contrast)"
                    : "var(--text-dark)",
              }}
            >
              {ty === "expense" ? "รายจ่าย" : "รายรับ"}
            </button>
          ))}
        </div>
        <label className={labelCls}>หมวดหมู่</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className={`${inputCls} mb-3`}
        >
          {CATEGORY_OPTIONS[form.type].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className={labelCls}>อัปโหลดสลิป (ไม่บังคับ)</label>
        <div className="mb-3">
          <div
            className={`mm-well flex items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-[var(--border)] bg-[var(--input-bg)] ${
              slipPreview ? "p-2" : "px-3 py-3.5"
            }`}
          >
            {slipPreview ? (
              <button
                type="button"
                onClick={() => setSlipLightboxOpen(true)}
                aria-label="ดูรูปสลิปเต็มจอ"
                className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-[var(--border)] bg-transparent p-0 cursor-zoom-in"
              >
                <img
                  src={slipPreview}
                  alt="สลิป"
                  className="block h-full w-full object-cover"
                />
              </button>
            ) : (
              <label
                htmlFor="slip-upload"
                className="mm-btn-3d flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[var(--card-alt)] cursor-pointer"
              >
                <Plus size={16} className="text-[var(--text-muted)]" />
              </label>
            )}

            <label
              htmlFor="slip-upload"
              className="flex-1 cursor-pointer text-xs text-[var(--text-muted)]"
            >
              {slipReading
                ? "กำลังอ่านยอดเงินจากสลิป..."
                : slipPreview
                  ? "อัปโหลดแล้ว — แตะรูปเพื่อดู / แตะข้อความนี้เพื่อเปลี่ยนรูป"
                  : "แตะเพื่อเลือกรูปสลิป ระบบจะอ่านยอดเงินให้อัตโนมัติ"}
            </label>
          </div>
          <input
            id="slip-upload"
            type="file"
            accept="image/*"
            onChange={handleSlipUpload}
            className="hidden"
          />
          {slipError && (
            <p className="mt-1.5 mb-0 text-[11px] text-[var(--expense)]">
              {slipError}
            </p>
          )}
        </div>
        <label className={labelCls}>จำนวนเงิน (บาท)</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          placeholder="0"
          className={`${inputCls} mb-3`}
        />
        <label className={labelCls}>วันที่</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className={`${inputCls} mb-3`}
        />
        <label className={labelCls}>รายละเอียดเพิ่มเติม</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="เช่น ข้าวเที่ยงกับเพื่อน"
          className={`${inputCls} mb-1.5`}
        />
        {formError && (
          <p className="mt-1.5 mb-0 text-xs text-[var(--expense)]">
            {formError}
          </p>
        )}
        <button
          onClick={() => submitForm(false)}
          className="mm-btn-3d mm-btn-primary mt-3.5 w-full rounded-lg border-none bg-[var(--accent)] py-[11px] text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </button>
        {!editingId && (
          <button
            onClick={() => submitForm(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent py-2.5 text-xs font-semibold text-[var(--text-muted)] cursor-pointer"
          >
            <Star size={12} /> เพิ่มและบันทึกเป็นรายการโปรด
          </button>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ยืนยันการลบ"
      >
        <div className="text-center">
          <p className="mb-1 mt-0 text-sm text-[var(--text-dark)]">
            ต้องการลบรายการ <b>{deleteTarget?.category}</b> ใช่ไหม?
          </p>
          <p className="mb-[18px] mt-0 text-xs text-[var(--text-muted)]">
            การลบนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="mm-btn-3d flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-semibold text-[var(--text-dark)] cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDelete}
              className="mm-btn-3d flex-1 rounded-lg border-none bg-[var(--expense)] py-2.5 font-semibold text-white cursor-pointer"
            >
              ลบรายการ
            </button>
          </div>
        </div>
      </Modal>
      {/* Logout confirm modal */}
      <Modal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="ยืนยันการออกจากระบบ"
      >
        <div className="text-center">
          <p className="mb-1 mt-0 text-sm text-[var(--text-dark)]">
            ต้องการออกจากระบบใช่ไหม?
          </p>
          <p className="mb-[18px] mt-0 text-xs text-[var(--text-muted)]">
            คุณจะต้องเข้าสู่ระบบใหม่อีกครั้งในการใช้งานครั้งถัดไป
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setLogoutConfirmOpen(false)}
              className="mm-btn-3d flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-semibold text-[var(--text-dark)] cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmLogout}
              className="mm-btn-3d flex-1 rounded-lg border-none bg-[var(--expense)] py-2.5 font-semibold text-white cursor-pointer"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile modal */}
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="แก้ไขโปรไฟล์"
      >
        <label className={labelCls}>รูปโปรไฟล์</label>
        <div className="mb-4 flex flex-wrap gap-2.5">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setProfileForm((f) => ({ ...f, avatar: a.id }))}
              aria-label={a.label}
              title={a.label}
              className="mm-btn-3d flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--card-alt)] p-0 cursor-pointer"
              style={{
                border: `2px solid ${profileForm.avatar === a.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <img
                src={a.src}
                alt={a.label}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        <label className={labelCls}>
          <UserIcon size={12} className="mr-1 -mb-px inline" />
          ชื่อผู้ใช้
        </label>
        <input
          type="text"
          value={profileForm.name}
          onChange={(e) =>
            setProfileForm((f) => ({ ...f, name: e.target.value }))
          }
          className={`${inputCls} mb-3`}
        />
        <label className={labelCls}>
          <Mail size={12} className="mr-1 -mb-px inline" />
          อีเมล
        </label>
        <input
          type="email"
          value={profileForm.email}
          onChange={(e) =>
            setProfileForm((f) => ({ ...f, email: e.target.value }))
          }
          className={`${inputCls} mb-1.5`}
        />
        <button
          onClick={saveProfile}
          className="mm-btn-3d mm-btn-primary mt-3.5 w-full rounded-lg border-none bg-[var(--accent)] py-[11px] text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          บันทึก
        </button>
      </Modal>

      {/* Settings modal: budgets / savings goal / recurring / favorites */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="ตั้งค่า"
        wide
      >
        <h4 className="m-0 mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-dark)]">
          <PiggyBank size={14} /> งบประมาณรายหมวดหมู่ (ต่อเดือน)
        </h4>
        <div className="mb-4 flex flex-col gap-2">
          {CATEGORY_OPTIONS.expense.map((cat) => {
            const draft = budgetDraft[cat] || { amount: "", period: "monthly" };
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-[76px] shrink-0 text-xs text-[var(--text-dark)]">
                  {cat}
                </span>
                <input
                  type="number"
                  value={draft.amount}
                  onChange={(e) =>
                    setBudgetDraft((d) => ({
                      ...d,
                      [cat]: { ...draft, amount: e.target.value },
                    }))
                  }
                  placeholder="ไม่ตั้งงบ"
                  className={`${inputCls} h-8 flex-1 text-xs`}
                />
                <select
                  value={draft.period}
                  onChange={(e) =>
                    setBudgetDraft((d) => ({
                      ...d,
                      [cat]: { ...draft, period: e.target.value },
                    }))
                  }
                  className={`${selectCls} h-8 w-[92px] shrink-0 text-xs`}
                >
                  <option value="monthly">รายเดือน</option>
                  <option value="weekly">รายสัปดาห์</option>
                </select>
              </div>
            );
          })}
        </div>

        <button
          onClick={saveSettings}
          className="mm-btn-3d mm-btn-primary mb-5 w-full rounded-lg border-none bg-[var(--accent)] py-2.5 text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          บันทึกงบประมาณ & เป้าหมาย
        </button>

        <h4 className="m-0 mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-dark)]">
          <Repeat size={14} /> รายการเกิดซ้ำทุกเดือน
        </h4>
        <div className="mb-2.5 flex flex-col gap-1.5">
          {recurringList.length === 0 && (
            <p className="m-0 text-[11px] text-[var(--text-muted)]">
              ยังไม่มีรายการเกิดซ้ำ เช่น เงินเดือน, ค่าหอ, ค่าเน็ต
            </p>
          )}
          {recurringList.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2.5 py-1.5"
            >
              <span className="text-xs text-[var(--text-dark)]">
                {r.type === "income" ? "รายรับ" : "รายจ่าย"} · {r.category} ·{" "}
                {formatBaht(r.amount)}
              </span>
              <button
                onClick={() => removeRecurring(r.id)}
                aria-label="ลบรายการเกิดซ้ำ"
                className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
              >
                <X size={11} className="text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
        <div className="mb-2 flex gap-1.5">
          <select
            value={newRecurring.type}
            onChange={(e) =>
              setNewRecurring((r) => ({
                ...r,
                type: e.target.value,
                category: CATEGORY_OPTIONS[e.target.value][0],
              }))
            }
            className={`${selectCls} h-8 text-xs`}
          >
            <option value="expense">รายจ่าย</option>
            <option value="income">รายรับ</option>
          </select>
          <select
            value={newRecurring.category}
            onChange={(e) =>
              setNewRecurring((r) => ({ ...r, category: e.target.value }))
            }
            className={`${selectCls} h-8 flex-1 text-xs`}
          >
            {CATEGORY_OPTIONS[newRecurring.type].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2.5 flex gap-1.5">
          <input
            type="number"
            value={newRecurring.amount}
            onChange={(e) =>
              setNewRecurring((r) => ({ ...r, amount: e.target.value }))
            }
            placeholder="จำนวนเงิน"
            className={`${inputCls} h-8 text-xs`}
          />
          <input
            type="text"
            value={newRecurring.note}
            onChange={(e) =>
              setNewRecurring((r) => ({ ...r, note: e.target.value }))
            }
            placeholder="รายละเอียด (ไม่บังคับ)"
            className={`${inputCls} h-8 text-xs`}
          />
        </div>
        <label className="mb-2.5 flex cursor-pointer items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={alsoSaveFavorite}
            onChange={(e) => setAlsoSaveFavorite(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--accent)]"
          />
          บันทึกเป็นรายการโปรดด้วย
        </label>
        <button
          onClick={addRecurring}
          className="mm-btn-3d mb-5 w-full rounded-lg border border-[var(--border)] bg-transparent py-2 text-xs font-semibold text-[var(--text-dark)] cursor-pointer"
        >
          + เพิ่มรายการเกิดซ้ำ
        </button>

        <h4 className="m-0 mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-dark)]">
          <Star size={14} /> รายการโปรด
        </h4>
        <div className="flex flex-col gap-1.5">
          {favorites.length === 0 && (
            <p className="m-0 text-[11px] text-[var(--text-muted)]">
              ยังไม่มีรายการโปรด กดปุ่ม "เพิ่มและบันทึกเป็นรายการโปรด"
              ตอนเพิ่มรายการได้เลย
            </p>
          )}
          {favorites.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-2.5 py-1.5"
            >
              <span className="text-xs text-[var(--text-dark)]">
                {f.label} · {formatBaht(f.amount)}
              </span>
              <button
                onClick={() => removeFavorite(f.id)}
                aria-label="ลบรายการโปรด"
                className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
              >
                <X size={11} className="text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Slip image lightbox */}
      {slipLightboxOpen && slipPreview && (
        <div
          onClick={() => setSlipLightboxOpen(false)}
          className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/80 p-6"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSlipLightboxOpen(false);
            }}
            aria-label="ปิด"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border-none bg-white/15 cursor-pointer"
          >
            <X size={18} className="text-white" />
          </button>
          <img
            src={slipPreview}
            alt="สลิปเต็มจอ"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          />
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          key={toast.id}
          className="mm-toast mm-surface fixed right-5 top-5 z-[100] min-w-[240px] max-w-[300px] overflow-hidden rounded-xl bg-[var(--card)]"
        >
          <div className="flex items-center gap-2.5 px-4 py-[13px]">
            <div
              className="mm-icon-well flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  toast.type === "error"
                    ? "var(--expense-bg)"
                    : "var(--income-bg)",
              }}
            >
              {toast.type === "error" ? (
                <Trash2 size={13} className="text-[var(--expense)]" />
              ) : (
                <Heart size={13} className="text-[var(--income)]" />
              )}
            </div>
            <span className="text-[13px] font-semibold text-[var(--text-dark)]">
              {toast.message}
            </span>
          </div>
          <div
            key={toast.id}
            className="mm-toast-bar h-[3px]"
            style={{
              background:
                toast.type === "error" ? "var(--expense)" : "var(--income)",
            }}
          />
        </div>
      )}
      {/* Pie chart modal: สัดส่วนรายจ่าย */}
      <Modal
        open={pieModalOpen}
        onClose={() => setPieModalOpen(false)}
        title="สัดส่วนรายจ่าย"
      >
        {pieData.length === 0 ? (
          <EmptyState label="สัดส่วนรายจ่าย" />
        ) : (
          <>
            <div style={{ width: "100%", height: 280, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <defs>
                    {PIE_COLORS.map((color, i) => (
                      <radialGradient
                        key={i}
                        id={`pieGrad-${i}`}
                        cx="35%"
                        cy="30%"
                        r="75%"
                      >
                        <stop offset="0%" stopColor={lightenHex(color, 22)} />
                        <stop offset="100%" stopColor={color} />
                      </radialGradient>
                    ))}
                    <filter
                      id="pieShadow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="5"
                        stdDeviation="6"
                        floodColor={darkMode ? "#000000" : "#4b3a99"}
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={100}
                    paddingAngle={3}
                    cornerRadius={8}
                    stroke={C.card}
                    strokeWidth={3}
                    filter="url(#pieShadow)"
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={`url(#pieGrad-${i % PIE_COLORS.length})`}
                      />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v) => formatBaht(v)}
                    contentStyle={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      boxShadow: C.shadowCard,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* ยอดรวมตรงกลางโดนัท */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                  รวมรายจ่าย
                </span>
                <span className="text-base font-extrabold text-[var(--text-dark)]">
                  {formatBaht(pieData.reduce((s, e) => s + e.value, 0))}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {pieData.map((entry, i) => (
                <div
                  key={entry.name}
                  className="mm-chip flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-dark)]"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 35% 30%, ${lightenHex(PIE_COLORS[i % PIE_COLORS.length], 30)}, ${PIE_COLORS[i % PIE_COLORS.length]})`,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                    }}
                  />
                  {entry.name}
                  <span className="text-[var(--text-muted)]">
                    {formatBaht(entry.value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Savings goals modal */}
      <Modal
        open={savingsModalOpen}
        onClose={() => setSavingsModalOpen(false)}
        title="เป้าหมายออม"
        wide
      >
        <div className="mb-4 flex flex-col gap-3">
          {savingsGoals.length === 0 && (
            <p className="m-0 text-[11px] text-[var(--text-muted)]">
              ยังไม่มีเป้าหมายออม เพิ่มเป้าหมายแรกได้เลยด้านล่าง
            </p>
          )}
          {savingsGoals.map((g) => {
            const ratio = g.target > 0 ? g.saved / g.target : 0;
            const isDepositing = depositingGoalId === g.id;
            const isEditing = editingGoalId === g.id;
            return (
              <div
                key={g.id}
                className="rounded-xl border border-[var(--border)] p-3"
              >
                {isEditing ? (
                  <div className="mb-1.5 flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={editGoalDraft.name}
                      onChange={(e) =>
                        setEditGoalDraft((d) => ({
                          ...d,
                          name: e.target.value,
                        }))
                      }
                      placeholder="ชื่อเป้าหมาย"
                      className={`${inputCls} h-8 text-xs`}
                    />
                    <input
                      type="number"
                      value={editGoalDraft.target}
                      onChange={(e) =>
                        setEditGoalDraft((d) => ({
                          ...d,
                          target: e.target.value,
                        }))
                      }
                      placeholder="จำนวนเงินเป้าหมาย (บาท)"
                      className={`${inputCls} h-8 text-xs`}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => submitEditGoal(g.id)}
                        className="mm-btn-3d mm-btn-primary flex-1 rounded-lg border-none bg-[var(--accent)] py-1.5 text-xs font-semibold text-[var(--accent-contrast)] cursor-pointer"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingGoalId(null)}
                        className="mm-btn-3d flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent cursor-pointer"
                      >
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[var(--text-dark)]">
                      {g.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoalId(g.id);
                          setEditGoalDraft({
                            name: g.name,
                            target: String(g.target),
                          });
                        }}
                        aria-label="แก้ไขเป้าหมาย"
                        className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
                      >
                        <Pencil
                          size={11}
                          className="text-[var(--text-muted)]"
                        />
                      </button>
                      <button
                        onClick={() => removeSavingsGoal(g.id)}
                        aria-label="ลบเป้าหมาย"
                        className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
                      >
                        <X size={11} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                )}

                <ProgressBar ratio={ratio} color="var(--income)" />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>
                    {formatBaht(g.saved)} / {formatBaht(g.target)}
                  </span>
                  <span>{Math.round(ratio * 100)}%</span>
                </div>

                {isDepositing ? (
                  <div className="mt-2">
                    <p className="mb-1.5 text-[10px] text-[var(--text-muted)]">
                      คงเหลือปัจจุบัน: {formatBaht(overallTotals.balance)}
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="จำนวนเงิน"
                        autoFocus
                        className={`${inputCls} h-8 flex-1 text-xs`}
                      />
                      <button
                        onClick={() => submitDeposit(g.id)}
                        className="mm-btn-3d mm-btn-primary shrink-0 rounded-lg border-none bg-[var(--accent)] px-3 text-xs font-semibold text-[var(--accent-contrast)] cursor-pointer"
                      >
                        ยืนยัน
                      </button>
                      <button
                        onClick={() => {
                          setDepositingGoalId(null);
                          setDepositAmount("");
                        }}
                        aria-label="ยกเลิก"
                        className="mm-btn-3d flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent cursor-pointer"
                      >
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  !isEditing && (
                    <button
                      onClick={() => {
                        setDepositingGoalId(g.id);
                        setDepositAmount("");
                      }}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline cursor-pointer bg-transparent border-none p-0"
                    >
                      <PiggyBank size={12} /> เติมเงินเข้าเป้าหมายนี้
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>

        <h4 className="m-0 mb-2.5 text-[13px] font-bold text-[var(--text-dark)]">
          เพิ่มเป้าหมายใหม่
        </h4>
        <div className="mb-2.5 flex flex-col gap-2">
          <input
            type="text"
            value={newGoal.name}
            onChange={(e) =>
              setNewGoal((g) => ({ ...g, name: e.target.value }))
            }
            placeholder="ชื่อเป้าหมาย เช่น ซื้อแล็ปท็อป"
            className={inputCls}
          />
          <input
            type="number"
            value={newGoal.target}
            onChange={(e) =>
              setNewGoal((g) => ({ ...g, target: e.target.value }))
            }
            placeholder="จำนวนเงินเป้าหมาย (บาท)"
            className={inputCls}
          />
        </div>
        <button
          onClick={addSavingsGoal}
          className="mm-btn-3d mm-btn-primary w-full rounded-lg border-none bg-[var(--accent)] py-2.5 text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          + เพิ่มเป้าหมาย
        </button>
      </Modal>
      {/* Income/Expense modal */}
      <Modal
        open={incomeExpenseModalOpen}
        onClose={() => setIncomeExpenseModalOpen(false)}
        title="รายรับ-รายจ่าย"
        wide
      >
        {transactions.length === 0 ? (
          <EmptyState label="รายรับ-รายจ่าย" />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="mm-surface relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mm-icon-well mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--income-bg)]">
                  <TrendingUp size={16} className="text-[var(--income)]" />
                </div>
                <div className="mb-1 text-xs font-semibold text-[var(--text-muted)]">
                  รายรับรวม
                </div>
                <div className="text-xl font-extrabold text-[var(--text-dark)]">
                  {formatBaht(overallTotals.income)}
                </div>
              </div>
              <div className="mm-surface relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="mm-icon-well mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--expense-bg)]">
                  <TrendingDown size={16} className="text-[var(--expense)]" />
                </div>
                <div className="mb-1 text-xs font-semibold text-[var(--text-muted)]">
                  รายจ่ายรวม
                </div>
                <div className="text-xl font-extrabold text-[var(--text-dark)]">
                  {formatBaht(overallTotals.expense)}
                </div>
              </div>
            </div>

            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="m-0 text-[13px] font-bold text-[var(--text-dark)]">
                แนวโน้มรายเดือน
              </h4>
              <select
                value={trendMonthsRange}
                onChange={(e) =>
                  setTrendMonthsRange(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className={`${selectCls} h-7 w-[130px] text-[11px]`}
              >
                <option value={3}>ย้อนหลัง 3 เดือน</option>
                <option value={6}>ย้อนหลัง 6 เดือน</option>
                <option value={12}>ย้อนหลัง 12 เดือน</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>
            {trendData.length > 0 ? (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={trendData} barGap={6} barCategoryGap="30%">
                    <defs>
                      <linearGradient
                        id="incomeGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={lightenHex(C.income, 18)}
                        />
                        <stop offset="100%" stopColor={C.income} />
                      </linearGradient>
                      <linearGradient
                        id="expenseGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={lightenHex(C.expense, 18)}
                        />
                        <stop offset="100%" stopColor={C.expense} />
                      </linearGradient>
                      <filter
                        id="barShadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="4"
                          stdDeviation="4"
                          floodColor={darkMode ? "#000000" : "#4b3a99"}
                          floodOpacity="0.3"
                        />
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.border}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: C.textMuted }}
                      axisLine={{ stroke: C.border }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: C.textMuted }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RTooltip
                      formatter={(v) => formatBaht(v)}
                      cursor={{ fill: C.cardAlt, opacity: 0.5, radius: 8 }}
                      contentStyle={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        boxShadow: C.shadowCard,
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="รายรับ"
                      fill="url(#incomeGrad)"
                      radius={[8, 8, 0, 0]}
                      filter="url(#barShadow)"
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="รายจ่าย"
                      fill="url(#expenseGrad)"
                      radius={[8, 8, 0, 0]}
                      filter="url(#barShadow)"
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="m-0 text-[12px] text-[var(--text-muted)]">
                ยังไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟ
              </p>
            )}
          </>
        )}
      </Modal>
      {/* History modal */}
      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="ประวัติการทำรายการ"
        wide
      >
        <div className="mm-well mb-2.5 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาหมวดหมู่หรือรายละเอียด..."
            className="h-[34px] w-full border-none bg-transparent text-[13px] text-[var(--text-dark)] outline-none"
          />
        </div>

        <div className="mb-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`${selectCls} flex-1 basis-[45%] min-w-0 sm:basis-[120px]`}
          >
            <option value="all">ทุกประเภท</option>
            <option value="income">รายรับ</option>
            <option value="expense">รายจ่าย</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${selectCls} flex-1 basis-[45%] min-w-0 sm:basis-[120px]`}
          >
            <option value="all">ทุกหมวดหมู่</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={`${selectCls} flex-1 basis-[45%] min-w-0 sm:basis-[120px]`}
          >
            <option value="all">ทุกเดือน</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1, 1).toLocaleDateString("th-TH", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={`${selectCls} flex-1 basis-[45%] min-w-0 sm:basis-[120px]`}
          >
            <option value="all">ทุกปี</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mm-btn-3d flex h-[34px] items-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent px-3 text-xs font-semibold text-[var(--text-muted)] cursor-pointer"
            >
              <FilterX size={13} /> ล้างตัวกรอง
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 && (
            <EmptyState
              label={
                hasActiveFilters ? "เงื่อนไขที่เลือก" : "ประวัติการทำรายการ"
              }
            />
          )}
          {filtered.map((t) => (
            <div
              key={t.id}
              className="mm-surface flex flex-wrap items-center justify-between gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="mm-icon-well flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      t.type === "income"
                        ? "var(--income-bg)"
                        : "var(--expense-bg)",
                  }}
                >
                  {t.type === "income" ? (
                    <TrendingUp size={14} className="text-[var(--income)]" />
                  ) : (
                    <TrendingDown size={14} className="text-[var(--expense)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-dark)]">
                    {t.category}
                    {t.recurringId && (
                      <span
                        title="รายการอัตโนมัติ"
                        className="flex items-center gap-0.5 rounded-full bg-[var(--card-alt)] px-1.5 py-[1px] text-[9px] font-semibold text-[var(--text-muted)]"
                      >
                        <Repeat size={9} /> อัตโนมัติ
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[11px] text-[var(--text-muted)]">
                    {formatDate(t.date)}
                    {t.createdAt ? ` · เวลา ${formatTime(t.createdAt)} น.` : ""}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="whitespace-nowrap text-[13px] font-bold"
                  style={{
                    color:
                      t.type === "income" ? "var(--income)" : "var(--expense)",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatBaht(t.amount)}
                </span>
                <button
                  onClick={() => openEditForm(t)}
                  aria-label="แก้ไข"
                  className={iconBtnCls}
                >
                  <Pencil size={13} className="text-[var(--text-muted)]" />
                </button>
                <button
                  onClick={() => {
                    setHistoryModalOpen(false);
                    setDeleteTarget(t);
                  }}
                  aria-label="ลบ"
                  className={iconBtnCls}
                >
                  <Trash2 size={13} className="text-[var(--expense)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
      {/* Monthly summary modal */}
      <Modal
        open={monthlySummaryModalOpen}
        onClose={() => setMonthlySummaryModalOpen(false)}
        title="สรุปยอดรายเดือน"
        wide
      >
        {monthlySummary.length === 0 ? (
          <EmptyState label="สรุปยอดรายเดือน" />
        ) : (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {monthlySummary.map((m) => {
              const active =
                filterYear !== "all" &&
                filterMonth !== "all" &&
                m.key ===
                  `${filterYear}-${String(filterMonth).padStart(2, "0")}`;
              return (
                <button
                  key={m.key}
                  onClick={() => {
                    const [y, mo] = m.key.split("-");
                    setFilterYear(y);
                    setFilterMonth(String(Number(mo)));
                    setMonthlySummaryModalOpen(false);
                    setHistoryModalOpen(true);
                  }}
                  className={`rounded-lg border border-[var(--border)] px-3 py-2.5 text-left cursor-pointer ${active ? "mm-well" : ""}`}
                  style={{
                    background: active ? "var(--card-alt)" : "transparent",
                  }}
                >
                  <div className="mb-1 text-xs font-semibold text-[var(--text-dark)]">
                    {monthLabel(m.key)}
                  </div>
                  <div className="flex justify-between gap-1.5 text-[11px]">
                    <span className="text-[var(--income)]">
                      +{formatBaht(m.income)}
                    </span>
                    <span className="text-[var(--expense)]">
                      -{formatBaht(m.expense)}
                    </span>
                    <span className="font-bold text-[var(--text-dark)]">
                      {formatBaht(m.balance)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Budget modal */}
      <Modal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        title="งบประมาณ"
        wide
      >
        <div className="mb-4 flex flex-col gap-3">
          {budgetProgress.length === 0 && (
            <p className="m-0 text-[11px] text-[var(--text-muted)]">
              ยังไม่มีงบประมาณ เพิ่มหมวดหมู่แรกได้เลยด้านล่าง
            </p>
          )}
          {budgetProgress.map((b) => {
            const isEditing = editingBudgetCategory === b.category;
            return (
              <div
                key={b.category}
                className="rounded-xl border border-[var(--border)] p-3"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-semibold text-[var(--text-dark)]">
                      {b.category}
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={editBudgetDraft.amount}
                        onChange={(e) =>
                          setEditBudgetDraft((d) => ({
                            ...d,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="จำนวนเงิน"
                        autoFocus
                        className={`${inputCls} h-8 flex-1 text-xs`}
                      />
                      <select
                        value={editBudgetDraft.period}
                        onChange={(e) =>
                          setEditBudgetDraft((d) => ({
                            ...d,
                            period: e.target.value,
                          }))
                        }
                        className={`${selectCls} h-8 w-[100px] shrink-0 text-xs`}
                      >
                        <option value="monthly">รายเดือน</option>
                        <option value="weekly">รายสัปดาห์</option>
                      </select>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => submitEditBudget(b.category)}
                        className="mm-btn-3d mm-btn-primary flex-1 rounded-lg border-none bg-[var(--accent)] py-1.5 text-xs font-semibold text-[var(--accent-contrast)] cursor-pointer"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={() => setEditingBudgetCategory(null)}
                        className="mm-btn-3d flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-transparent cursor-pointer"
                      >
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-dark)]">
                        {b.category}
                        <span className="rounded-full bg-[var(--card-alt)] px-1.5 py-[1px] text-[9px] font-medium text-[var(--text-muted)]">
                          {b.period === "weekly" ? "รายสัปดาห์" : "รายเดือน"}
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBudgetCategory(b.category);
                            setEditBudgetDraft({
                              amount: String(b.amount),
                              period: b.period,
                            });
                          }}
                          aria-label="แก้ไขงบประมาณ"
                          className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
                        >
                          <Pencil
                            size={11}
                            className="text-[var(--text-muted)]"
                          />
                        </button>
                        <button
                          onClick={() => removeBudget(b.category)}
                          aria-label="ลบงบประมาณ"
                          className="mm-btn-3d flex h-6 w-6 items-center justify-center rounded-md border-none bg-[var(--card-alt)] cursor-pointer"
                        >
                          <X size={11} className="text-[var(--text-muted)]" />
                        </button>
                      </div>
                    </div>
                    <ProgressBar
                      ratio={b.ratio}
                      color={
                        b.ratio >= 1
                          ? "var(--expense)"
                          : b.ratio >= 0.8
                            ? "var(--warn)"
                            : "var(--income)"
                      }
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>
                        {formatBaht(b.spent)} / {formatBaht(b.amount)}
                      </span>
                      <span>{Math.round(b.ratio * 100)}%</span>
                    </div>
                    <p className="m-0 mt-1 text-[10px] text-[var(--text-muted)]">
                      รีเซ็ตอัตโนมัติทุกต้น
                      {b.period === "weekly" ? "สัปดาห์" : "เดือน"}{" "}
                      ไม่ต้องบันทึกอะไรเพิ่ม
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {(() => {
          const usedCategories = Object.keys(budgets);
          const availableCategories = CATEGORY_OPTIONS.expense.filter(
            (c) => !usedCategories.includes(c),
          );

          if (availableCategories.length === 0) {
            return (
              <p className="m-0 text-[11px] text-[var(--text-muted)]">
                ตั้งงบประมาณครบทุกหมวดหมู่แล้ว กดไอคอนดินสอด้านบนเพื่อแก้ไข
              </p>
            );
          }

          return (
            <>
              <h4 className="m-0 mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[var(--text-dark)]">
                เพิ่มงบประมาณใหม่
              </h4>
              <div className="mb-2.5 flex flex-col gap-2">
                <select
                  value={
                    availableCategories.includes(newBudget.category)
                      ? newBudget.category
                      : availableCategories[0]
                  }
                  onChange={(e) =>
                    setNewBudget((b) => ({ ...b, category: e.target.value }))
                  }
                  className={inputCls}
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) =>
                      setNewBudget((b) => ({ ...b, amount: e.target.value }))
                    }
                    placeholder="จำนวนเงินงบประมาณ (บาท)"
                    className={`${inputCls} flex-1`}
                  />
                  <select
                    value={newBudget.period}
                    onChange={(e) =>
                      setNewBudget((b) => ({ ...b, period: e.target.value }))
                    }
                    className={`${selectCls} w-[110px] shrink-0`}
                  >
                    <option value="monthly">รายเดือน</option>
                    <option value="weekly">รายสัปดาห์</option>
                  </select>
                </div>
              </div>
              <button
                onClick={addBudget}
                className="mm-btn-3d mm-btn-primary w-full rounded-lg border-none bg-[var(--accent)] py-2.5 text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
              >
                + เพิ่มงบประมาณ
              </button>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
