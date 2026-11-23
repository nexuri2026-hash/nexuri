"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  Monitor, Users, ClipboardList, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpRight, CheckCircle2, Clock, XCircle, Wifi, WifiOff, Activity,
  Zap, Package, ChevronRight, Building2, FileText, Calendar
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── Stat Widget ──────────────────────────────────────────────────────────────
function StatWidget({ title, value, sub, icon: Icon, color, glow, trend }: {
  title: string; value: number | string; sub: string;
  icon: React.ElementType; color: string; glow?: string; trend?: "up" | "down" | null;
}) {
  return (
    <div className="stat-card" style={{ boxShadow: glow }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}40` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: trend === "up" ? "#FF5C8A" : "#C81D3A" }}>
            {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color: "#FFE3EC" }}>{value}</div>
      <div className="text-sm font-semibold mb-0.5" style={{ color: "#FF9FB5" }}>{title}</div>
      <div className="text-xs" style={{ color: "rgba(255,159,181,0.65)" }}>{sub}</div>
    </div>
  );
}

// ─── Mini Cards ─────────────────────────────────────────────────────
function MiniCard({ label, value, color, icon: Icon }: {
  label: string; value: number | string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${color}14`, border: `1px solid ${color}35` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}26` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <div className="text-xl font-bold leading-none mb-0.5" style={{ color }}>{value}</div>
        <div className="text-xs font-medium" style={{ color: "#FFE3EC", opacity: 0.8 }}>{label}</div>
      </div>
    </div>
  );
}

const COMPANY_COLORS: Record<string, string> = {
  "NCR":             "#FF5C8A",
  "SANTANDER":       "#C81D3A",
  "IBM":             "#FF9FB5",
  "FALABELLA":       "#E03E6D",
  "ITAU":            "#FF789E",
  "ITAÚ":            "#FF789E",
  "BCI":             "#FFE3EC",
  "SIN ESPECIFICAR": "#7A2E40",
  "SETRAC":          "#D4375C",
};

const FALLBACK_COLORS = ["#FF5C8A", "#C81D3A", "#FF9FB5", "#FFE3EC", "#7A2E40", "#E03E6D"];

function getCompanyColor(name: string, index: number): string {
  const key = name.trim().toUpperCase();
  for (const [k, v] of Object.entries(COMPANY_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

// Keep COLORS alias for backward compat
const COLORS = FALLBACK_COLORS;


export default function DashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: servicios, error } = await supabase
        .from("servicios")
        .select("*");
      
      if (servicios) {
        setData(servicios);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // ─── Derived Metrics ────────────────────────────────────────────────────────
  const totalServicios = data.length;
  
  const conInforme = data.filter(r => r.informe?.toUpperCase() === 'SI').length;
  const sinInforme = data.filter(r => r.informe?.toUpperCase() === 'NO').length;
  const noRequiere = data.filter(r => r.informe?.toUpperCase() === 'N/A').length;
  const requierenInforme = conInforme + sinInforme;

  const bancoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(r => {
      let b = r.banco_empresa?.trim() || "Sin Especificar";
      counts[b] = (counts[b] || 0) + 1;
    });
    // Convert to array for charts
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const topBancos = bancoCounts.slice(0, 5); // Para minicards u otras vistas

  // Conteo por Mes y Año
  const timelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(r => {
      if (!r.fecha) return;
      const parts = r.fecha.split("-");
      if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = `20${year}`;
        const month = parts[1];
        const key = `${year}-${month}`; // YYYY-MM for sorting
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const monthName = monthNames[parseInt(month, 10) - 1] || month;
        return { 
          name: `${monthName} ${year}`, 
          value 
        };
      });
  }, [data]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Dashboard General</h2>
          <p className="section-subtitle">Métricas en tiempo real desde Supabase</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "rgba(255,92,138,0.14)", border: "1px solid rgba(255,92,138,0.35)", color: "#FF9FB5" }}>
          <Activity size={13} style={{ color: "#FF5C8A" }} />
          Datos Actualizados
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center" style={{ color: "#FF9FB5" }}>Cargando métricas...</div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget 
              title="Total Coordinaciones" 
              value={totalServicios} 
              sub={`${requierenInforme} requieren informe · ${noRequiere} N/A`} 
              icon={ClipboardList} 
              color="#FF5C8A" 
              glow="0 0 24px rgba(255,92,138,0.12)" 
            />
            <StatWidget 
              title="Con Informe (SI)" 
              value={conInforme} 
              sub={`${((conInforme / (requierenInforme || 1)) * 100 || 0).toFixed(1)}% de los requeridos`} 
              icon={CheckCircle2} 
              color="#FF9FB5" 
              glow="0 0 24px rgba(255,159,181,0.12)" 
            />
            <StatWidget 
              title="Sin Informe (NO)" 
              value={sinInforme} 
              sub={`${((sinInforme / (requierenInforme || 1)) * 100 || 0).toFixed(1)}% de los requeridos`} 
              icon={XCircle} 
              color="#C81D3A" 
              glow="0 0 24px rgba(200,29,58,0.16)" 
            />
            <StatWidget 
              title="Bancos/Empresas" 
              value={bancoCounts.length} 
              sub="Entidades registradas" 
              icon={Building2} 
              color="#FFE3EC" 
              glow="0 0 24px rgba(255,227,236,0.08)" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gráfico Banco / Empresa */}
            <div className="glass-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#FFE3EC" }}>Conteo por Banco / Empresa</div>
                  <div className="text-xs" style={{ color: "#FF9FB5", opacity: 0.75 }}>Cantidad de servicios asignados a cada entidad</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bancoCounts} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,159,181,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#FF9FB5", fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                    angle={-45} 
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#FF9FB5", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(33,15,24,0.96)", border: "1px solid rgba(255,159,181,0.3)", borderRadius: 10, color: "#FFE3EC", fontSize: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.6)" }}
                    itemStyle={{ color: "#FFE3EC", fontWeight: 600 }}
                    labelStyle={{ color: "#FF9FB5", marginBottom: 4 }}
                    cursor={{ fill: "rgba(255,92,138,0.08)" }}
                  />
                  <Bar dataKey="value" name="Servicios" radius={[6, 6, 0, 0]}>
                    {bancoCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCompanyColor(entry.name, index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Resumen Top Bancos */}
            <div className="glass-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-sm" style={{ color: "#FFE3EC" }}>Top Entidades</div>
                <Link href="/dashboard/coordinacion" className="text-xs flex items-center gap-1" style={{ color: "#FF5C8A", fontWeight: 600 }}>
                  Ver detalle <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex-1 flex justify-center items-center mb-2">
                <PieChart width={200} height={180}>
                  <Pie 
                    data={bancoCounts.slice(0, 5)} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={80} 
                    paddingAngle={2} 
                    dataKey="value"
                  >
                    {bancoCounts.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCompanyColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "rgba(255,255,255,0.95)", border: "none", borderRadius: 8, color: "#0f172a", fontSize: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#334155", fontWeight: 600 }}
                  />
                </PieChart>
              </div>
              <div className="space-y-2 mt-auto">
                {topBancos.map((b, i) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: getCompanyColor(b.name, i) }}></div>
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{b.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Línea de Tiempo (Mes/Año) */}
            <div className="glass-card p-5 lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#FFE3EC" }}>Historial por Mes y Año</div>
                  <div className="text-xs" style={{ color: "#FF9FB5", opacity: 0.75 }}>Volumen de coordinaciones distribuidas a lo largo del tiempo</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5C8A" stopOpacity={0.42}/>
                      <stop offset="95%" stopColor="#C81D3A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,159,181,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#FF9FB5", fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis tick={{ fill: "#FF9FB5", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(33,15,24,0.96)", border: "1px solid rgba(255,159,181,0.3)", borderRadius: 10, color: "#FFE3EC", fontSize: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.6)" }}
                    itemStyle={{ color: "#FFE3EC", fontWeight: 600 }}
                    labelStyle={{ color: "#FF9FB5", marginBottom: 4 }}
                  />
                  <Area type="monotone" dataKey="value" name="Coordinaciones" stroke="#FF5C8A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTime)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Info Adicional */}
            <div className="glass-card p-5">
              <div className="font-semibold text-sm mb-4" style={{ color: "#FFE3EC" }}>Distribución de Informes</div>
              <div className="grid grid-cols-2 gap-3">
                <MiniCard label="Con Informe" value={conInforme} color="#FF9FB5" icon={FileText} />
                <MiniCard label="Sin Informe" value={sinInforme} color="#C81D3A" icon={AlertTriangle} />
              </div>
              <div className="mt-4 pt-4 border-t text-xs" style={{ borderColor: "rgba(255,159,181,0.14)", color: "#FF9FB5" }}>
                Llevas un control del {(totalServicios > 0 ? (conInforme / totalServicios) * 100 : 0).toFixed(1)}% de los servicios con informes completados en sistema.
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="glass-card p-5">
              <div className="font-semibold text-sm mb-4" style={{ color: "#FFE3EC" }}>Accesos Rápidos</div>
              <div className="space-y-2">
                <Link href="/dashboard/coordinacion" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,159,181,0.16)", background: "rgba(255,92,138,0.05)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(200,29,58,0.25)", color: "#FF9FB5" }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#FFE3EC" }}>Ver Coordinación</div>
                      <div className="text-xs" style={{ color: "#FF9FB5", opacity: 0.75 }}>Gestiona la programación diaria</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "#FF5C8A" }} />
                </Link>
                <Link href="/dashboard/cotizaciones" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: "1px solid rgba(255,159,181,0.16)", background: "rgba(255,92,138,0.05)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,92,138,0.22)", color: "#FFE3EC" }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#FFE3EC" }}>Ver Cotizaciones</div>
                      <div className="text-xs" style={{ color: "#FF9FB5", opacity: 0.75 }}>Crear y descargar cotizaciones</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: "#FF5C8A" }} />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
