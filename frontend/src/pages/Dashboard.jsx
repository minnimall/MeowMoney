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

const THEMES = {
  light: {
    bg: "#efebe9",
    card: "#fffdfb",
    cardAlt: "#e4d4bc",
    border: "#e4d4bc",
    accent: "#a1887f",
    accentContrast: "#ffffff",
    textDark: "#4e342e",
    textMuted: "#8d7468",
    income: "#7d9471",
    incomeBg: "#e8eee2",
    expense: "#c17767",
    expenseBg: "#f5e5df",
    inputBg: "#ffffff",
    overlay: "rgba(78,52,46,0.4)",
  },
  dark: {
    bg: "#241c19",
    card: "#332822",
    cardAlt: "#3d302a",
    border: "#4a3b34",
    accent: "#c2a58e",
    accentContrast: "#2a201b",
    textDark: "#f3ebe4",
    textMuted: "#bda99c",
    income: "#9bbb8c",
    incomeBg: "#33392e",
    expense: "#e0917d",
    expenseBg: "#402f2c",
    inputBg: "#2b221d",
    overlay: "rgba(0,0,0,0.55)",
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

function Modal({ open, onClose, children, title, C }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: C.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 14,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: C.textDark,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="ปิด"
            style={{
              background: C.cardAlt,
              border: "none",
              borderRadius: 8,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const C = darkMode ? THEMES.dark : THEMES.light;

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
    } else {
      setTransactions((prev) => [
        { id: Date.now(), ...form, amount: Number(form.amount) },
        ...prev,
      ]);
    }
    setFormOpen(false);
  }
  function confirmDelete() {
    setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  }
  function saveProfile() {
    setProfile(profileForm);
    setProfileOpen(false);
  }

  const selectStyle = {
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    height: 34,
    fontSize: 13,
    color: C.textDark,
    padding: "0 10px",
  };
  const iconBtnStyle = {
    background: C.cardAlt,
    border: "none",
    borderRadius: 8,
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  };
  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: C.textMuted,
    marginBottom: 5,
  };
  const inputStyle = {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    padding: "0 12px",
    fontSize: 14,
    color: C.textDark,
    background: C.inputBg,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "background 0.3s ease",
      }}
    >
      <style>{`
        .mm-main-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; }
        .mm-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .mm-summary-grid > div { min-width: 0; }
        .mm-balance-gif { width: 77px; height: 77px; }
        @media (max-width: 480px) {
          .mm-balance-gif { width: 48px; height: 48px; }
        }
        .mm-filters-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
        .mm-select { flex: 1 1 auto; min-width: 120px; }
        .mm-add-btn { margin-left: auto; }
        .mm-container { max-width: 920px; margin: 0 auto; padding: 24px; }
        .mm-page-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
        .mm-navbar { padding: 12px 24px; }
        .mm-txn-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .mm-txn-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        @media (max-width: 760px) {
          .mm-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .mm-container { padding: 16px; }
          .mm-navbar { padding: 10px 14px; }
          .mm-page-header { flex-wrap: wrap; }
          .mm-add-btn { margin-left: 0; width: 100%; justify-content: center; }
          .mm-filters-row { gap: 6px; }
          .mm-select { min-width: 0; flex: 1 1 45%; }
          .mm-summary-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; }
          .mm-balance-card { grid-column: 1 / -1; }
          .mm-txn-row { flex-wrap: wrap; }
        }
        @media (max-width: 420px) {
          .mm-select { flex: 1 1 100%; }
        }
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
      `}</style>

      {showSplash && (
        <div
          className={`mm-splash${splashLeaving ? " mm-splash-out" : ""}`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: C.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={logoMeowMoney}
            alt="MeowMoney"
            className="mm-splash-logo"
            style={{ width: 640, height: 640, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Everything except the footer lives inside this flex:1 wrapper,
          so the footer always gets pushed to the bottom of the viewport
          even when there isn't enough content to fill the screen. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <div
          className="mm-navbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: C.card,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={logoMeowMoney}
                alt="MeowMoney"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "contain",
                  borderRadius: 12,
                  flexShrink: 0,
                  boxShadow: darkMode
                    ? "0 2px 10px rgba(0,0,0,0.4)"
                    : "0 2px 8px rgba(78,52,46,0.18)",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setDarkMode((d) => !d)}
                aria-label={darkMode ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `1px solid ${C.border}`,
                  background: C.cardAlt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {darkMode ? (
                  <Sun size={15} color={C.textDark} />
                ) : (
                  <Moon size={15} color={C.textDark} />
                )}
              </button>
              <button
                onClick={() => {
                  setProfileForm(profile);
                  setProfileOpen(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px 4px 4px",
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: C.cardAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.textDark,
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {(() => {
                    const avatarSrc = AVATAR_OPTIONS.find(
                      (a) => a.id === profile.avatar,
                    )?.src;
                    return avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={profile.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      profile.name.charAt(0)
                    );
                  })()}
                </div>
                <span
                  style={{ fontSize: 13, color: C.textDark, fontWeight: 500 }}
                >
                  {profile.name}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mm-container">
          {/* Page header */}
          <div className="mm-page-header">
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: C.textDark,
              }}
            >
              ระบบรายรับ-รายจ่าย
            </h2>
            <button
              onClick={openAddForm}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: C.accent,
                border: "none",
                color: C.accentContrast,
                fontSize: 13,
                fontWeight: 600,
                height: 34,
                padding: "0 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> เพิ่มรายการ
            </button>
          </div>
          {/* Summary */}
          <div className="mm-summary-grid">
            <div
              style={{
                background: C.card,
                borderRadius: 12,
                padding: "16px 18px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: C.income,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <TrendingUp size={14} /> รายรับรวม
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.textDark }}>
                {formatBaht(totals.income)}
              </div>
            </div>
            <div
              style={{
                background: C.card,
                borderRadius: 12,
                padding: "16px 18px",
                border: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: C.expense,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <TrendingDown size={14} /> รายจ่ายรวม
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.textDark }}>
                {formatBaht(totals.expense)}
              </div>
            </div>
            <div
              className="mm-balance-card"
              style={{
                background: C.accent,
                borderRadius: 12,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: C.accentContrast,
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                    opacity: 0.9,
                  }}
                >
                  <Wallet size={14} /> คงเหลือ
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.accentContrast,
                  }}
                >
                  {formatBaht(totals.balance)}
                </div>
              </div>
              <img
                src={GIF_DATA_URI}
                alt="แมวมีความสุข"
                style={{
                  width: 77,
                  height: 77,
                  objectFit: "contain",
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>

          <div className="mm-main-grid">
            {/* Left: filters + list */}
            <div>
              <div className="mm-filters-row">
                <select
                  className="mm-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">ทุกประเภท</option>
                  <option value="income">รายรับ</option>
                  <option value="expense">รายจ่าย</option>
                </select>
                <select
                  className="mm-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className="mm-select"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={selectStyle}
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
                  className="mm-select"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  style={selectStyle}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: `1px solid ${C.border}`,
                      color: C.textMuted,
                      fontSize: 12,
                      fontWeight: 600,
                      height: 34,
                      padding: "0 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <FilterX size={13} /> ล้างตัวกรอง
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filtered.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      color: C.textMuted,
                      fontSize: 13,
                      background: C.card,
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    ไม่มีรายการตามเงื่อนไขที่เลือก
                  </div>
                )}
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="mm-txn-row"
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background:
                            t.type === "income" ? C.incomeBg : C.expenseBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {t.type === "income" ? (
                          <TrendingUp size={14} color={C.income} />
                        ) : (
                          <TrendingDown size={14} color={C.expense} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.textDark,
                          }}
                        >
                          {t.category}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.textMuted,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(t.date)}
                          {t.note ? ` · ${t.note}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="mm-txn-actions">
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: t.type === "income" ? C.income : C.expense,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatBaht(t.amount)}
                      </span>
                      <button
                        onClick={() => openEditForm(t)}
                        aria-label="แก้ไข"
                        style={iconBtnStyle}
                      >
                        <Pencil size={13} color={C.textMuted} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        aria-label="ลบ"
                        style={iconBtnStyle}
                      >
                        <Trash2 size={13} color={C.expense} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: monthly summary */}
            <div
              style={{
                background: C.card,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                padding: 16,
                height: "fit-content",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textDark,
                }}
              >
                สรุปยอดรายเดือน
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                      style={{
                        textAlign: "left",
                        border: "none",
                        cursor: "pointer",
                        background: active ? C.cardAlt : "transparent",
                        borderRadius: 8,
                        padding: "8px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.textDark,
                          marginBottom: 3,
                        }}
                      >
                        {monthLabel(m.key)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          gap: 6,
                        }}
                      >
                        <span style={{ color: C.income }}>
                          +{formatBaht(m.income)}
                        </span>
                        <span style={{ color: C.expense }}>
                          -{formatBaht(m.expense)}
                        </span>
                        <span style={{ color: C.textDark, fontWeight: 700 }}>
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
      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "20px 24px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <img
          src="https://media.tenor.com/wWYDcbdOMWQAAAAd/cat-kiss-kiss-cat.gif"
          alt="Cute Kissing Cat"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            margin: "0 auto 10px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 6,
          }}
        ></div>

        <p style={{ margin: 0, fontSize: 14, color: C.textMuted }}>
          © 2026 Dullapah Taweesaengsiri. All Rights Reserved.
        </p>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
        C={C}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
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
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: `1px solid ${form.type === ty ? C.accent : C.border}`,
                background: form.type === ty ? C.accent : C.card,
                color: form.type === ty ? C.accentContrast : C.textDark,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {ty === "expense" ? "รายจ่าย" : "รายรับ"}
            </button>
          ))}
        </div>
        <label style={labelStyle}>หมวดหมู่</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          style={{ ...inputStyle, marginBottom: 12 }}
        >
          {CATEGORY_OPTIONS[form.type].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label style={labelStyle}>จำนวนเงิน (บาท)</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          placeholder="0"
          style={{ ...inputStyle, marginBottom: 12 }}
        />
        <label style={labelStyle}>วันที่</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          style={{ ...inputStyle, marginBottom: 12 }}
        />
        <label style={labelStyle}>รายละเอียดเพิ่มเติม</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          placeholder="เช่น ข้าวเที่ยงกับเพื่อน"
          style={{ ...inputStyle, marginBottom: 6 }}
        />
        {formError && (
          <p style={{ color: C.expense, fontSize: 12, margin: "6px 0 0" }}>
            {formError}
          </p>
        )}
        <button
          onClick={submitForm}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "11px 0",
            borderRadius: 8,
            border: "none",
            background: C.accent,
            color: C.accentContrast,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
        </button>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ยืนยันการลบ"
        C={C}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: C.textDark, margin: "0 0 4px" }}>
            ต้องการลบรายการ <b>{deleteTarget?.category}</b> ใช่ไหม?
          </p>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 18px" }}>
            การลบนี้ไม่สามารถย้อนกลับได้
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.textDark,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ยกเลิก
            </button>
            <button
              onClick={confirmDelete}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: C.expense,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
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
        C={C}
      >
        <label style={labelStyle}>รูปโปรไฟล์</label>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setProfileForm((f) => ({ ...f, avatar: a.id }))}
              aria-label={a.label}
              title={a.label}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid ${profileForm.avatar === a.id ? C.accent : C.border}`,
                background: C.cardAlt,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: C.textDark,
                flexShrink: 0,
              }}
            >
              {a.src ? (
                <img
                  src={a.src}
                  alt={a.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                profileForm.name.charAt(0)
              )}
            </button>
          ))}
        </div>

        <label style={labelStyle}>
          <UserIcon size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
          ชื่อผู้ใช้
        </label>
        <input
          type="text"
          value={profileForm.name}
          onChange={(e) =>
            setProfileForm((f) => ({ ...f, name: e.target.value }))
          }
          style={{ ...inputStyle, marginBottom: 12 }}
        />
        <label style={labelStyle}>
          <Mail size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
          อีเมล
        </label>
        <input
          type="email"
          value={profileForm.email}
          onChange={(e) =>
            setProfileForm((f) => ({ ...f, email: e.target.value }))
          }
          style={{ ...inputStyle, marginBottom: 6 }}
        />
        <button
          onClick={saveProfile}
          style={{
            width: "100%",
            marginTop: 14,
            padding: "11px 0",
            borderRadius: 8,
            border: "none",
            background: C.accent,
            color: C.accentContrast,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          บันทึก
        </button>
      </Modal>
    </div>
  );
}
