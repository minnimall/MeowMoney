import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
import logoMeowMoney from "../assets/logomeowv2.png";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
/* ---------- ธีมเดียวกับ Dashboard: เงาสองโทนให้พื้นผิว "ยกตัว/บุ๋ม" จริง ---------- */
const THEMES = {
  light: {
    bg: "#f4f1fc",
    card: "#ffffff",
    cardAlt: "#ede6fb",
    border: "#e3daf7",
    accent: "#6c5ce7",
    accentPink: "#ff6fa0",
    accentContrast: "#ffffff",
    textDark: "#241d3d",
    textMuted: "#8a81a8",
    inputBg: "#ffffff",
    danger: "#ff6f61",
    dangerBg: "#ffeae6",
    shadowCard:
      "-6px -6px 14px rgba(255,255,255,0.85), 8px 10px 22px rgba(108,92,231,0.16)",
    shadowBtn:
      "-3px -3px 8px rgba(255,255,255,0.7), 4px 6px 14px rgba(108,92,231,0.28)",
    shadowBtnPressed: "inset 2px 2px 6px rgba(0,0,0,0.18)",
    shadowWell:
      "inset 2px 3px 6px rgba(36,29,61,0.12), inset -2px -2px 4px rgba(255,255,255,0.6)",
    shadowFloat: "0 20px 46px rgba(108,92,231,0.28)",
  },
  dark: {
    bg: "#150f26",
    card: "#1e1836",
    cardAlt: "#2a2247",
    border: "#372c55",
    accent: "#9b87f5",
    accentPink: "#ff8fb6",
    accentContrast: "#150f26",
    textDark: "#f1edfb",
    textMuted: "#a79ecb",
    inputBg: "#241d3d",
    danger: "#ff8a7a",
    dangerBg: "#3a2632",
    shadowCard:
      "-5px -5px 12px rgba(255,255,255,0.03), 9px 11px 24px rgba(0,0,0,0.55)",
    shadowBtn:
      "-3px -3px 8px rgba(255,255,255,0.04), 4px 6px 14px rgba(0,0,0,0.5)",
    shadowBtnPressed: "inset 2px 2px 6px rgba(0,0,0,0.5)",
    shadowWell:
      "inset 2px 3px 6px rgba(0,0,0,0.55), inset -2px -2px 4px rgba(255,255,255,0.03)",
    shadowFloat: "0 24px 50px rgba(0,0,0,0.55)",
  },
};

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

function Field({ icon: Icon, label, error, ...props }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-[6px] block text-xs font-semibold text-[var(--text-muted)]">
        {label}
      </span>
      <div className="mm-well flex h-[44px] items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5">
        <Icon size={15} className="shrink-0 text-[var(--text-muted)]" />
        <input
          {...props}
          className="h-full w-full min-w-0 border-none bg-transparent text-sm text-[var(--text-dark)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>
      {error && (
        <span className="mt-1 block text-[11px] text-[var(--danger)]">
          {error}
        </span>
      )}
    </label>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const C = darkMode ? THEMES.dark : THEMES.light;
  const themeVars = {
    "--bg": C.bg,
    "--card": C.card,
    "--card-alt": C.cardAlt,
    "--border": C.border,
    "--accent": C.accent,
    "--accent-pink": C.accentPink,
    "--accent-contrast": C.accentContrast,
    "--text-dark": C.textDark,
    "--text-muted": C.textMuted,
    "--input-bg": C.inputBg,
    "--danger": C.danger,
    "--danger-bg": C.dangerBg,
    "--shadow-card": C.shadowCard,
    "--shadow-btn": C.shadowBtn,
    "--shadow-btn-pressed": C.shadowBtnPressed,
    "--shadow-well": C.shadowWell,
    "--shadow-float": C.shadowFloat,
  };

  function validateLogin() {
    const e = {};
    if (!loginForm.email.trim()) e.email = "กรอกอีเมลด้วยนะ";
    if (!loginForm.password) e.password = "กรอกรหัสผ่านด้วยนะ";
    return e;
  }
  function validateRegister() {
    const e = {};
    if (!regForm.name.trim()) e.name = "กรอกชื่อของคุณ";
    if (!regForm.email.trim()) e.email = "กรอกอีเมลด้วยนะ";
    else if (!/^\S+@\S+\.\S+$/.test(regForm.email)) e.email = "อีเมลไม่ถูกต้อง";
    if (!regForm.password) e.password = "ตั้งรหัสผ่านด้วยนะ";
    else if (regForm.password.length < 6) e.password = "อย่างน้อย 6 ตัวอักษร";
    if (regForm.confirm !== regForm.password) e.confirm = "รหัสผ่านไม่ตรงกัน";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = mode === "login" ? validateLogin() : validateRegister();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(loginForm);
      } else {
        await register({
          username: regForm.name,
          email: regForm.email,
          password: regForm.password,
        });
      }
      navigate("/");
    } catch (err) {
      setErrors({
        email: err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
  }

  return (
    <div
      style={themeVars}
      className="flex min-h-screen w-full items-center justify-center bg-[var(--bg)] p-4 transition-colors duration-300"
    >
      <style>{`
        .mm-well { box-shadow: var(--shadow-well); }
        .mm-surface { box-shadow: var(--shadow-card); }
        .mm-btn-3d { box-shadow: var(--shadow-btn); transition: transform .12s ease, box-shadow .12s ease; }
        .mm-btn-3d:active { transform: translateY(2px); box-shadow: var(--shadow-btn-pressed); }
        .mm-tab { transition: transform .15s ease, box-shadow .15s ease, color .15s ease; }
        .mm-tab--active { box-shadow: var(--shadow-btn); }
        .mm-tab--idle:hover { transform: translateY(-1px); }
        .mm-float { animation: mm-float 3.4s ease-in-out infinite; }
        @keyframes mm-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        .mm-panel-switch { transition: opacity .18s ease, transform .18s ease; }
      `}</style>

      <div className="w-full max-w-[880px]">
        <div className="mm-surface grid grid-cols-1 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] md:grid-cols-[1.05fr_1fr]">
          {/* Left: brand / signature panel — flat gradient tile, no blur blobs */}
          <div
            className="relative hidden flex-col justify-between overflow-hidden p-8 md:flex"
            style={{
              backgroundImage:
                "linear-gradient(150deg, var(--accent) 0%, var(--accent-pink) 100%)",
            }}
          >
            <div className="pointer-events-none absolute -bottom-8 -left-8 opacity-[0.14]">
              <PawIcon size={190} color="#ffffff" />
            </div>

            <div className="relative z-10 flex items-center gap-2.5 text-white">
              <img
                src={logoMeowMoney}
                alt="MeowMoney"
                className="h-18 w-18 object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight">
                MeowMoney
              </span>
            </div>

            <div className="relative z-10 text-white">
              <h2 className="m-0 mb-2 text-[26px] font-extrabold leading-tight">
                จดรายรับรายจ่าย <br className="hidden lg:block" />
                ให้แมวของคุณอิ่มท้อง
              </h2>
              <p className="m-0 text-sm text-white/85">
                บันทึกไว เห็นภาพรวมเงินง่าย
                พร้อมเพื่อนแมวที่คอยเตือนเวลาใช้จ่ายเกินงบ
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 text-white/80">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full bg-white/90"
                  style={{
                    width: i === 0 ? 22 : 8,
                    opacity: i === 0 ? 1 : 0.45,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: form panel */}
          <div className="flex flex-col p-6 sm:p-9">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5 md:hidden">
                <img
                  src={logoMeowMoney}
                  alt="MeowMoney"
                  className="h-11 w-11 object-contain"
                  style={{
                    filter: "drop-shadow(0 4px 10px rgba(108,92,231,0.35))",
                  }}
                />
                <span
                  className="bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-pink) 100%)",
                  }}
                >
                  MeowMoney
                </span>
              </div>
              <button
                onClick={() => setDarkMode((d) => !d)}
                aria-label="สลับธีม"
                className="mm-btn-3d ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-alt)] cursor-pointer"
              >
                {darkMode ? (
                  <Sun size={14} className="text-[var(--text-dark)]" />
                ) : (
                  <Moon size={14} className="text-[var(--text-dark)]" />
                )}
              </button>
            </div>

            {/* Tab switch: raised = active, flat = idle (physical toggle, not a colored pill) */}
            <div className="mm-well mb-6 flex gap-1 rounded-2xl bg-[var(--card-alt)] p-1.5">
              <button
                onClick={() => switchMode("login")}
                className={`mm-tab flex-1 rounded-xl py-2.5 text-[13px] font-bold cursor-pointer ${
                  mode === "login" ? "mm-tab--active" : "mm-tab--idle"
                }`}
                style={{
                  background: mode === "login" ? "var(--card)" : "transparent",
                  color:
                    mode === "login" ? "var(--text-dark)" : "var(--text-muted)",
                }}
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`mm-tab flex-1 rounded-xl py-2.5 text-[13px] font-bold cursor-pointer ${
                  mode === "register" ? "mm-tab--active" : "mm-tab--idle"
                }`}
                style={{
                  background:
                    mode === "register" ? "var(--card)" : "transparent",
                  color:
                    mode === "register"
                      ? "var(--text-dark)"
                      : "var(--text-muted)",
                }}
              >
                สมัครสมาชิก
              </button>
            </div>

            <div className="mm-panel-switch">
              <h1 className="m-0 mb-1 text-xl font-extrabold text-[var(--text-dark)]">
                {mode === "login" ? "ยินดีต้อนรับ 👋" : "สร้างบัญชีใหม่"}
              </h1>
              <p className="m-0 mb-6 text-[13px] text-[var(--text-muted)]">
                {mode === "login"
                  ? "เข้าสู่ระบบเพื่อดูสถานะเงินและน้องแมวของคุณ"
                  : "ใช้เวลาไม่ถึงนาที แล้วเริ่มเลี้ยงแมวออมเงินได้เลย"}
              </p>

              <form onSubmit={handleSubmit} noValidate>
                {mode === "register" && (
                  <Field
                    icon={UserIcon}
                    label="ชื่อผู้ใช้"
                    type="text"
                    placeholder="เช่น น้องแมว"
                    value={regForm.name}
                    onChange={(e) =>
                      setRegForm((f) => ({ ...f, name: e.target.value }))
                    }
                    error={errors.name}
                  />
                )}

                <Field
                  icon={Mail}
                  label="อีเมล"
                  type="email"
                  placeholder="you@example.com"
                  value={mode === "login" ? loginForm.email : regForm.email}
                  onChange={(e) =>
                    mode === "login"
                      ? setLoginForm((f) => ({ ...f, email: e.target.value }))
                      : setRegForm((f) => ({ ...f, email: e.target.value }))
                  }
                  error={errors.email}
                />

                <label className="mb-3.5 block">
                  <span className="mb-[6px] block text-xs font-semibold text-[var(--text-muted)]">
                    รหัสผ่าน
                  </span>
                  <div className="mm-well flex h-[44px] items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5">
                    <Lock
                      size={15}
                      className="shrink-0 text-[var(--text-muted)]"
                    />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={
                        mode === "login" ? loginForm.password : regForm.password
                      }
                      onChange={(e) =>
                        mode === "login"
                          ? setLoginForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                          : setRegForm((f) => ({
                              ...f,
                              password: e.target.value,
                            }))
                      }
                      className="h-full w-full min-w-0 border-none bg-transparent text-sm text-[var(--text-dark)] outline-none placeholder:text-[var(--text-muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label="แสดง/ซ่อนรหัสผ่าน"
                      className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-[var(--text-muted)]"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="mt-1 block text-[11px] text-[var(--danger)]">
                      {errors.password}
                    </span>
                  )}
                </label>

                {mode === "register" && (
                  <label className="mb-3.5 block">
                    <span className="mb-[6px] block text-xs font-semibold text-[var(--text-muted)]">
                      ยืนยันรหัสผ่าน
                    </span>
                    <div className="mm-well flex h-[44px] items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5">
                      <Lock
                        size={15}
                        className="shrink-0 text-[var(--text-muted)]"
                      />
                      <input
                        type={showPw2 ? "text" : "password"}
                        placeholder="••••••••"
                        value={regForm.confirm}
                        onChange={(e) =>
                          setRegForm((f) => ({ ...f, confirm: e.target.value }))
                        }
                        className="h-full w-full min-w-0 border-none bg-transparent text-sm text-[var(--text-dark)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw2((v) => !v)}
                        aria-label="แสดง/ซ่อนรหัสผ่าน"
                        className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-[var(--text-muted)]"
                      >
                        {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirm && (
                      <span className="mt-1 block text-[11px] text-[var(--danger)]">
                        {errors.confirm}
                      </span>
                    )}
                  </label>
                )}

                {mode === "login" && (
                  <div className="mb-5 flex items-center justify-between text-xs">
                    <label className="flex cursor-pointer items-center gap-1.5 text-[var(--text-muted)]">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-[var(--accent)]"
                      />
                      จำฉันไว้
                    </label>
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[var(--accent)]"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mm-btn-3d flex w-full items-center justify-center gap-1.5 rounded-xl border-none py-3 text-sm font-bold text-white cursor-pointer disabled:opacity-70"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--accent) 0%, var(--accent-pink) 100%)",
                  }}
                >
                  {submitting
                    ? "กำลังดำเนินการ..."
                    : mode === "login"
                      ? "เข้าสู่ระบบ"
                      : "สมัครสมาชิก"}
                  {!submitting && <ArrowRight size={15} />}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
                {mode === "login" ? (
                  <>
                    ยังไม่มีบัญชี?{" "}
                    <button
                      onClick={() => switchMode("register")}
                      className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[var(--accent)]"
                    >
                      สมัครสมาชิก
                    </button>
                  </>
                ) : (
                  <>
                    มีบัญชีอยู่แล้ว?{" "}
                    <button
                      onClick={() => switchMode("login")}
                      className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[var(--accent)]"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
