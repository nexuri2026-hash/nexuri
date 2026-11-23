"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Cpu, ShieldCheck, Zap, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CONFIG } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Correo o contraseña incorrectos. Intenta nuevamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #150b10 0%, #24111b 45%, #3d1828 100%)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[520px] p-12" style={{ background: "linear-gradient(180deg, rgba(200,29,58,0.18) 0%, rgba(122,46,64,0.22) 100%)", borderRight: "1px solid rgba(255,159,181,0.16)" }}>
        <div>
          <div className="flex items-center gap-3 mb-16">
            {CONFIG.USE_IMAGE_LOGO ? (
              <img src={CONFIG.LOGO_PATH} alt={`${CONFIG.SYSTEM_NAME} Logo`} style={{ height: "42px", width: "auto", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(255,227,236,0.2)" }} />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-500/10 border border-brand-500/20 text-brand-500">
                <Key size={20} />
              </div>
            )}
            <div>
              <div className="font-bold text-lg leading-none" style={{ color: "#FFE3EC" }}>{CONFIG.SYSTEM_NAME}</div>
              <div className="text-xs font-medium mt-1" style={{ color: "#FF9FB5" }}>Sistema de Operaciones</div>
            </div>
          </div>

          {/* Hero text */}
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: "#FFE3EC" }}>
            Gestión de operaciones
            <br />
            <span className="gradient-text">en tiempo real</span>
          </h1>
          <p style={{ color: "#FF9FB5", opacity: 0.85, fontSize: "15px", lineHeight: "1.7" }}>
            Control y gestión de operaciones, coordinaciones y cotizaciones — todo en una sola plataforma elegante.
          </p>
        </div>

        {/* Feature pills */}
        <div className="space-y-3">
          {[
            { icon: <Zap size={15} />, label: "Monitoreo en tiempo real", sub: "Coordinaciones y operaciones activas" },
            { icon: <ShieldCheck size={15} />, label: "Control de acceso por roles", sub: "Administrador, Supervisor y Operaria" },
            { icon: <Cpu size={15} />, label: "Cotizaciones y Calculadora", sub: "Generación rápida en un clic" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,227,236,0.04)", border: "1px solid rgba(255,159,181,0.16)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(200,29,58,0.35), rgba(255,92,138,0.25))", color: "#FF9FB5" }}>
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#FFE3EC" }}>{f.label}</div>
                <div className="text-xs" style={{ color: "#FF9FB5", opacity: 0.7 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ color: "#FF9FB5", opacity: 0.65, fontSize: "12px" }}>{CONFIG.COPYRIGHT_TEXT}</div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md glass-card p-8" style={{ border: "1px solid rgba(255,159,181,0.22)" }}>
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            {CONFIG.USE_IMAGE_LOGO ? (
              <img src={CONFIG.LOGO_PATH} alt={`${CONFIG.SYSTEM_NAME} Logo`} style={{ height: "40px", width: "auto", objectFit: "contain", borderRadius: "6px" }} />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-500/10 border border-brand-500/20 text-brand-500">
                <Key size={18} />
              </div>
            )}
            <div className="font-bold text-xl" style={{ color: "#FFE3EC" }}>{CONFIG.SYSTEM_NAME}</div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#FFE3EC" }}>Iniciar sesión</h2>
            <p style={{ color: "#FF9FB5", opacity: 0.8, fontSize: "14px" }}>Accede con tus credenciales corporativas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FF9FB5" }}>
                Correo electrónico
              </label>
              <input
                id="email-input"
                type="email"
                className="ops-input"
                placeholder={`tu@${CONFIG.DEFAULT_EMAIL_DOMAIN}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#FF9FB5" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="ops-input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#FF9FB5", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(200,29,58,0.2)", border: "1px solid rgba(255,92,138,0.4)", color: "#FFE3EC" }}>
                {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Autenticando…
                </>
              ) : (
                "Ingresar al sistema"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,159,181,0.65)" }}>
            ¿Problemas para ingresar?{" "}
            <span style={{ color: "#FF5C8A", fontWeight: 600 }}>Contacta al Administrador</span>
          </p>
        </div>
      </div>

      {/* Background decorations */}
      <div style={{ position: "fixed", top: "-200px", right: "-200px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,92,138,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-200px", left: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(200,29,58,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
    </div>
  );
}
