import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import GIF_DATA_URI from "../assets/yapapa-cat.gif";
import happyCatAvatar from "../assets/хаппи-happy-cat.gif";
import logoMeowMoney from "../assets/logomeowv2.png";
import Tesseract from "tesseract.js";

// สีทั้งหมดยังคงเก็บเป็น object เหมือนเดิม แต่แทนที่จะ apply ผ่าน style={{}}
// เราจะแปลงเป็น CSS variables แล้วอ้างอิงด้วย Tailwind arbitrary value เช่น
// bg-[var(--card)] เพราะ Tailwind ต้องเห็น class name แบบ static string
// ตอน build ถึงจะ generate CSS ให้ (จะใช้ template literal ต่อ class ตรงๆ ไม่ได้)
const THEMES = {
  light: {
    bg: "#efebe9",
    card: "#fffdfb",
    cardAlt: "#e4d4bc",
    border: "#e4d4bc",
    accent: "#a1887f",
    accent2: "#8d7565",
    accentContrast: "#ffffff",
    textDark: "#4e342e",
    textMuted: "#8d7468",
    income: "#7d9471",
    incomeBg: "#e8eee2",
    expense: "#c17767",
    expenseBg: "#f5e5df",
    inputBg: "#ffffff",
    overlay: "rgba(78,52,46,0.4)",
    shadowCard: "0 2px 12px rgba(78,52,46,0.06)",
    shadowBalance: "0 6px 18px rgba(78,52,46,0.22)",
    shadowLogo: "0 2px 8px rgba(78,52,46,0.18)",
  },
  dark: {
    bg: "#241c19",
    card: "#332822",
    cardAlt: "#3d302a",
    border: "#4a3b34",
    accent: "#c2a58e",
    accent2: "#8a725f",
    accentContrast: "#2a201b",
    textDark: "#f3ebe4",
    textMuted: "#bda99c",
    income: "#9bbb8c",
    incomeBg: "#33392e",
    expense: "#e0917d",
    expenseBg: "#402f2c",
    inputBg: "#2b221d",
    overlay: "rgba(0,0,0,0.55)",
    shadowCard: "0 2px 12px rgba(0,0,0,0.25)",
    shadowBalance: "0 6px 18px rgba(0,0,0,0.35)",
    shadowLogo: "0 2px 10px rgba(0,0,0,0.4)",
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

const SEED_DATA = [
  {
    id: 1,
    type: "income",
    category: "เงินเดือน",
    amount: 20000,
    date: "2026-07-01",
    note: "เงินเดือนกรกฎาคม",
  },
  {
    id: 2,
    type: "expense",
    category: "ค่าอาหาร",
    amount: 150,
    date: "2026-07-14",
    note: "ข้าวเที่ยง",
  },
  {
    id: 3,
    type: "expense",
    category: "ค่าเดินทาง",
    amount: 80,
    date: "2026-07-10",
    note: "ค่ารถเมล์",
  },
  {
    id: 4,
    type: "expense",
    category: "บันเทิง",
    amount: 350,
    date: "2026-07-08",
    note: "ดูหนังกับเพื่อน",
  },
  {
    id: 5,
    type: "income",
    category: "รายได้เสริม",
    amount: 4500,
    date: "2026-07-05",
    note: "ขายของออนไลน์",
  },
  {
    id: 6,
    type: "income",
    category: "เงินเดือน",
    amount: 20000,
    date: "2026-06-01",
    note: "เงินเดือนมิถุนายน",
  },
  {
    id: 7,
    type: "expense",
    category: "ค่าที่พัก",
    amount: 4500,
    date: "2026-06-03",
    note: "ค่าหอ",
  },
  {
    id: 8,
    type: "expense",
    category: "ค่าอาหาร",
    amount: 210,
    date: "2026-06-20",
    note: "",
  },
];

function CatMark({ size = 28, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="34" rx="22" ry="19" fill={color} />
      <polygon points="13,20 22,4 26,21" fill={color} />
      <polygon points="51,20 42,4 38,21" fill={color} />
      <circle cx="24" cy="33" r="2" fill="#4e342e" />
      <circle cx="40" cy="33" r="2" fill="#4e342e" />
      <path
        d="M27 40 Q32 43 37 40"
        stroke="#4e342e"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-[var(--card)] shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="m-0 text-base font-semibold text-[var(--text-dark)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            className="flex h-7 w-7 items-center justify-center rounded-lg border-none bg-[var(--card-alt)] cursor-pointer"
          >
            <X size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const C = darkMode ? THEMES.dark : THEMES.light;

  // ตัวแปร CSS ที่ทุก Tailwind arbitrary class ในไฟล์นี้อ้างอิงถึง
  const themeVars = {
    "--bg": C.bg,
    "--card": C.card,
    "--card-alt": C.cardAlt,
    "--border": C.border,
    "--accent": C.accent,
    "--accent2": C.accent2,
    "--accent-contrast": C.accentContrast,
    "--text-dark": C.textDark,
    "--text-muted": C.textMuted,
    "--income": C.income,
    "--income-bg": C.incomeBg,
    "--expense": C.expense,
    "--expense-bg": C.expenseBg,
    "--input-bg": C.inputBg,
    "--overlay": C.overlay,
    "--shadow-card": C.shadowCard,
    "--shadow-balance": C.shadowBalance,
    "--shadow-logo": C.shadowLogo,
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

  const [transactions, setTransactions] = useState(SEED_DATA);
  const [profile, setProfile] = useState({
    name: "น้องแมว",
    email: "meow@kku.ac.th",
    avatar: "yapapa",
  });
  const [profileForm, setProfileForm] = useState(profile);
  const [profileOpen, setProfileOpen] = useState(false);

  const AVATAR_OPTIONS = useMemo(
    () => [
      { id: "initial", label: "ตัวอักษรชื่อ", src: null },
      { id: "yapapa", label: "ยาป๊าป้า", src: GIF_DATA_URI },
      { id: "happy", label: "แมวมีความสุข", src: happyCatAvatar },
      {
        id: "robocat",
        label: "แมวสุ่ม (RoboHash)",
        src: `https://robohash.org/${encodeURIComponent(profileForm.email || "meow")}?set=set4`,
      },
    ],
    [profileForm.email],
  );

  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const [toast, setToast] = useState(null); // { message, type }
  function showToast(message, type = "success") {
    setToast({ message, type, id: Date.now() });
  }
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
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
    filterMonth !== "all";
  function clearFilters() {
    setFilterType("all");
    setFilterCategory("all");
    setFilterYear("all");
    setFilterMonth("all");
  }

  const filtered = useMemo(() => {
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
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, filterCategory, filterYear, filterMonth]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

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

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function preprocessImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // ขยายภาพขึ้น 2 เท่า ช่วยให้ OCR อ่านตัวอักษรเล็กๆ ได้ดีขึ้น
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;

        // แปลงเป็นขาวดำ (grayscale) + เพิ่ม contrast แบบ threshold
        // ช่วยตัดพื้นหลังลายเส้น/gradient ออกไป เหลือแต่ตัวอักษรเข้มชัด
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // threshold: ถ้าสว่างกว่าค่านี้ให้เป็นขาวล้วน มืดกว่าให้เป็นดำล้วน
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

      // กลยุทธ์ที่ 1: หาบรรทัดที่มีคำว่า "จำนวนเงิน" แล้วดึงตัวเลขจากบรรทัดนั้นหรือบรรทัดถัดไป
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

      // กลยุทธ์ที่ 2 (fallback): ถ้าหาคำว่า "จำนวนเงิน" ไม่เจอ ให้ตัดบรรทัดที่มีคำว่า
      // "ค่าธรรมเนียม" ออกก่อน (กันสับสนกับ 0.00) แล้วเลือกเลขที่มีค่ามากที่สุดที่เหลือ
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

      // เดาวันที่ รูปแบบ dd/mm/yyyy หรือ dd-mm-yyyy
      const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      let guessedDate = null;
      if (dateMatch) {
        const [, d, m, y] = dateMatch;
        let year = y.length === 2 ? `20${y}` : y;
        // สลิปไทยบางแบบใช้ปี พ.ศ. (เช่น 2569) ต้องแปลงเป็น ค.ศ.
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
      type: "expense",
      category: "ค่าอาหาร",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setFormError("");
    setSlipPreview(null);
    setSlipError("");
    setSlipLightboxOpen(false);
    setFormOpen(true);
  }
  function openEditForm(t) {
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
  function submitForm() {
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    if (!form.date) {
      setFormError("กรุณาเลือกวันที่");
      return;
    }
    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, ...form, amount: Number(form.amount) }
            : t,
        ),
      );
      showToast("แก้ไขรายการเรียบร้อยแล้ว");
    } else {
      setTransactions((prev) => [
        { id: Date.now(), ...form, amount: Number(form.amount) },
        ...prev,
      ]);
      showToast("เพิ่มรายการเรียบร้อยแล้ว");
    }
    setFormOpen(false);
  }
  function confirmDelete() {
    setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    showToast("ลบรายการเรียบร้อยแล้ว", "error");
    setDeleteTarget(null);
  }
  function saveProfile() {
    setProfile(profileForm);
    setProfileOpen(false);
  }

  // class ที่ใช้ซ้ำบ่อยๆ รวมไว้เป็นตัวแปรกันสับสน
  const selectCls =
    "h-[34px] rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2.5 text-[13px] text-[var(--text-dark)]";
  const iconBtnCls =
    "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border-none bg-[var(--card-alt)] cursor-pointer";
  const labelCls =
    "mb-[5px] block text-xs font-semibold text-[var(--text-muted)]";
  const inputCls =
    "box-border h-[38px] w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text-dark)]";

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
        .mm-toast { animation: mm-toast-in 0.25s ease, mm-toast-out 0.3s ease 2.7s forwards; }
        @keyframes mm-toast-in { from { opacity: 0; transform: translateY(-10px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes mm-toast-out { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(0.96); } }
        .mm-toast-bar { animation: mm-toast-shrink 3s linear forwards; transform-origin: left; }
        @keyframes mm-toast-shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      `}</style>

      {showSplash && (
        <div
          className={`mm-splash${splashLeaving ? " mm-splash-out" : ""} fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--bg)]`}
        >
          <img
            src={logoMeowMoney}
            alt="MeowMoney"
            className="mm-splash-logo h-[640px] w-[640px] object-contain"
          />
        </div>
      )}

      {/* Everything except the footer lives inside this flex:1 wrapper,
          so the footer always gets pushed to the bottom of the viewport
          even when there isn't enough content to fill the screen. */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logoMeowMoney}
                alt="MeowMoney"
                className="h-12 w-12 shrink-0 rounded-xl object-contain shadow-[var(--shadow-logo)]"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setDarkMode((d) => !d)}
                aria-label={darkMode ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-alt)] cursor-pointer"
              >
                {darkMode ? (
                  <Sun size={15} className="text-[var(--text-dark)]" />
                ) : (
                  <Moon size={15} className="text-[var(--text-dark)]" />
                )}
              </button>
              <button
                onClick={() => {
                  setProfileForm(profile);
                  setProfileOpen(true);
                }}
                className="flex items-center gap-2 rounded-[20px] border-none bg-transparent py-1 pl-1 pr-2 cursor-pointer"
              >
                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--card-alt)] text-xs font-bold text-[var(--text-dark)]">
                  {(() => {
                    const avatarSrc = AVATAR_OPTIONS.find(
                      (a) => a.id === profile.avatar,
                    )?.src;
                    return avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profile.name.charAt(0)
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
          {/* Page header */}
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-2.5">
            <h2 className="m-0 text-2xl font-bold text-[var(--text-dark)]">
              ระบบรายรับ-รายจ่าย
            </h2>
            <button
              onClick={openAddForm}
              aria-label="เพิ่มรายการ"
              className="flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border-none bg-[var(--accent)] text-[13px] font-semibold text-[var(--accent-contrast)] cursor-pointer sm:h-[34px] sm:w-auto sm:rounded-lg sm:px-3.5"
            >
              <Plus size={18} className="sm:hidden" />
              <Plus size={15} className="hidden sm:block" />
              <span className="hidden sm:inline">เพิ่มรายการ</span>
            </button>
          </div>
          {/* Summary */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            <div className="min-w-0 relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition-transform duration-150 hover:-translate-y-0.5 sm:p-5">
              <TrendingUp
                size={64}
                className="pointer-events-none absolute -right-3 -top-3 text-[var(--income)] opacity-[0.08]"
              />
              <div className="mb-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--income-bg)]">
                <TrendingUp size={16} className="text-[var(--income)]" />
              </div>
              <div className="mb-1 text-xs font-semibold text-[var(--text-muted)]">
                รายรับรวม
              </div>
              <div className="text-2xl font-extrabold tracking-[-0.3px] text-[var(--text-dark)]">
                {formatBaht(totals.income)}
              </div>
            </div>

            <div className="min-w-0 relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] transition-transform duration-150 hover:-translate-y-0.5 sm:p-5">
              <TrendingDown
                size={64}
                className="pointer-events-none absolute -right-3 -top-3 text-[var(--expense)] opacity-[0.08]"
              />
              <div className="mb-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--expense-bg)]">
                <TrendingDown size={16} className="text-[var(--expense)]" />
              </div>
              <div className="mb-1 text-xs font-semibold text-[var(--text-muted)]">
                รายจ่ายรวม
              </div>
              <div className="text-2xl font-extrabold tracking-[-0.3px] text-[var(--text-dark)]">
                {formatBaht(totals.expense)}
              </div>
            </div>

            <div
              className="col-span-2 min-w-0 relative overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-balance)] transition-transform duration-150 hover:-translate-y-0.5 sm:col-span-1 sm:p-5"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)",
              }}
            >
              <div className="pointer-events-none absolute -left-5 -bottom-6 opacity-[0.12]">
                <PawIcon size={130} color="#ffffff" />
              </div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="mb-2.5 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white/[0.18]">
                  <Wallet size={16} className="text-[var(--accent-contrast)]" />
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <PawIcon size={24} color="var(--accent-contrast)" />
                </div>
              </div>

              <div className="relative z-10 mb-1 text-xs font-semibold text-[var(--accent-contrast)] opacity-85">
                คงเหลือ
              </div>
              <div className="relative z-10 text-2xl font-extrabold tracking-[-0.3px] text-[var(--accent-contrast)]">
                {formatBaht(totals.balance)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {/* Left: filters + list */}
            <div>
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
                    className="flex h-[34px] items-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent px-3 text-xs font-semibold text-[var(--text-muted)] cursor-pointer"
                  >
                    <FilterX size={13} /> ล้างตัวกรอง
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                {filtered.length === 0 && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] py-8 text-center text-[13px] text-[var(--text-muted)]">
                    ไม่มีรายการตามเงื่อนไขที่เลือก
                  </div>
                )}
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
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
                        <div className="text-[13px] font-semibold text-[var(--text-dark)]">
                          {t.category}
                        </div>
                        <div className="truncate text-[11px] text-[var(--text-muted)]">
                          {formatDate(t.date)}
                          {t.note ? ` · ${t.note}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className="whitespace-nowrap text-[13px] font-bold"
                        style={{
                          color:
                            t.type === "income"
                              ? "var(--income)"
                              : "var(--expense)",
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
                        onClick={() => setDeleteTarget(t)}
                        aria-label="ลบ"
                        className={iconBtnCls}
                      >
                        <Trash2 size={13} className="text-[var(--expense)]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: monthly summary */}
            <div className="h-fit rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <h4 className="m-0 mb-3 text-[13px] font-bold text-[var(--text-dark)]">
                สรุปยอดรายเดือน
              </h4>
              <div className="flex flex-col gap-1">
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
                      }}
                      className="rounded-lg border-none px-2.5 py-2 text-left cursor-pointer"
                      style={{
                        background: active ? "var(--card-alt)" : "transparent",
                      }}
                    >
                      <div className="mb-[3px] text-xs font-semibold text-[var(--text-dark)]">
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer — always sits at the bottom of the viewport */}
      <div className="shrink-0 border-t border-[var(--border)] px-6 py-5 text-center">
        <img
          src="https://media.tenor.com/wWYDcbdOMWQAAAAd/cat-kiss-kiss-cat.gif"
          alt="Cute Kissing Cat"
          className="mx-auto mb-2.5 block h-[90px] w-[90px] rounded-full object-cover"
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
          {["expense", "income"].map((ty) => (
            <button
              key={ty}
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  type: ty,
                  category: CATEGORY_OPTIONS[ty][0],
                }))
              }
              className="flex-1 rounded-lg py-2.5 text-[13px] font-semibold cursor-pointer"
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
            className={`flex items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-[var(--border)] bg-[var(--input-bg)] ${
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
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[var(--card-alt)] cursor-pointer"
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
          onClick={submitForm}
          className="mt-3.5 w-full rounded-lg border-none bg-[var(--accent)] py-[11px] text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </button>
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
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 font-semibold text-[var(--text-dark)] cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 rounded-lg border-none bg-[var(--expense)] py-2.5 font-semibold text-white cursor-pointer"
            >
              ลบรายการ
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
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--card-alt)] p-0 text-base font-bold text-[var(--text-dark)] cursor-pointer"
              style={{
                border: `2px solid ${profileForm.avatar === a.id ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {a.src ? (
                <img
                  src={a.src}
                  alt={a.label}
                  className="h-full w-full object-cover"
                />
              ) : (
                profileForm.name.charAt(0)
              )}
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
          className="mt-3.5 w-full rounded-lg border-none bg-[var(--accent)] py-[11px] text-sm font-bold text-[var(--accent-contrast)] cursor-pointer"
        >
          บันทึก
        </button>
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
          className="mm-toast fixed right-5 top-5 z-[100] min-w-[240px] max-w-[300px] overflow-hidden rounded-xl bg-[var(--card)] shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
        >
          <div className="flex items-center gap-2.5 px-4 py-[13px]">
            <div
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full"
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
                <TrendingUp size={13} className="text-[var(--income)]" />
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
    </div>
  );
}