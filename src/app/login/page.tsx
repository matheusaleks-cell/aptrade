"use client";

import { useState } from "react";
import { loginInvestor } from "@/lib/actions";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const result = await loginInvestor(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Erro no login do investidor:", err);
      setError("Ocorreu um erro ao conectar ao servidor. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  }

  function fillDemo() {
    const form = document.getElementById("login-form") as HTMLFormElement;
    (form.elements.namedItem("email") as HTMLInputElement).value = "investidor@aptrade.com.br";
    (form.elements.namedItem("password") as HTMLInputElement).value = "123456";
  }

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#03050a]/98 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-8 max-w-xs text-center px-6">
            <div className="relative">
              <div className="absolute -inset-3 bg-[#F5C400]/10 rounded-3xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 flex items-center justify-center bg-white/[0.03] rounded-2xl border border-white/[0.08]">
                <img src="/logo.png" alt="Aptrade" className="h-10 w-auto object-contain" />
              </div>
            </div>
            <div className="w-8 h-8 border-2 border-[#F5C400]/20 border-t-[#F5C400] rounded-full animate-spin" />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">Conectando</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Acessando seu portfólio com segurança criptografada...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Screen */}
      <div className="min-h-[100dvh] bg-[#03050a] flex flex-col relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-[#F5C400]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[100px] pointer-events-none" />

        {/* Top Section - Logo & Branding */}
        <div className="flex-1 flex flex-col items-center justify-end pb-8 pt-16 px-6 relative z-10">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-[#F5C400]/5 rounded-3xl blur-2xl" />
            <div className="relative w-16 h-16 flex items-center justify-center bg-white/[0.03] rounded-2xl border border-white/[0.06] shadow-[0_0_40px_rgba(245,196,0,0.06)]">
              <img src="/logo.png" alt="Aptrade" className="h-8 w-auto object-contain" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight text-center">
            APTRADE <span className="text-[#F5C400]">Funding</span>
          </h1>
          <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-widest">
            Área do Investidor
          </p>
        </div>

        {/* Bottom Section - Form Card */}
        <div className="relative z-10 px-5 pb-8 w-full max-w-md mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[28px] border border-white/[0.06] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-medium mb-5 text-center">
                {error}
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#F5C400]/40 focus:ring-1 focus:ring-[#F5C400]/20 transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#F5C400]/40 focus:ring-1 focus:ring-[#F5C400]/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black font-bold text-sm rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_20px_rgba(245,196,0,0.15)] mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Entrar <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-col gap-3">
              <button
                onClick={fillDemo}
                className="w-full text-xs text-[#F5C400]/70 hover:text-[#F5C400] font-bold py-2 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Preencher dados de demonstração
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/admin/login" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors font-medium uppercase tracking-wider">
              Acesso Admin
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
              v2.0
            </span>
          </div>

          {/* Safe area spacer for mobile */}
          <div className="h-[env(safe-area-inset-bottom,0px)]" />
        </div>
      </div>
    </>
  );
}
