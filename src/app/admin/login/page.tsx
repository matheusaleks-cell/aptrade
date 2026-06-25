"use client";

import { useState } from "react";
import { loginAdmin } from "@/lib/actions";
import Link from "next/link";
import { Mail, Lock, ArrowLeft, Shield, Check } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      // Delay artificial para garantir a exibição da tela de carregamento estilo aplicativo
      await new Promise((resolve) => setTimeout(resolve, 400));

      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Erro no login do admin:", err);
      setError("Ocorreu um erro ao conectar ao servidor. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  }

  function fillDemo() {
    const form = document.getElementById("admin-login-form") as HTMLFormElement;
    (form.elements.namedItem("email") as HTMLInputElement).value = "admin@aptrade.com.br";
    (form.elements.namedItem("password") as HTMLInputElement).value = "admin123";
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060813]/95 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 max-w-xs text-center">
            {/* Container da logo com pulsação premium */}
            <div className="relative w-24 h-24 flex items-center justify-center bg-white/[0.02] rounded-3xl border border-white/[0.08] shadow-[0_0_50px_rgba(245,196,0,0.05)] animate-pulse">
              <img src="/logo.png" alt="Aptrade" className="h-12 w-auto object-contain" />
              <div className="absolute inset-0 bg-[#F5C400]/5 rounded-3xl blur-md pointer-events-none" />
            </div>
            
            {/* Spinner circular dourado de app fintech */}
            <div className="w-8 h-8 border-2 border-[#F5C400]/20 border-t-[#F5C400] rounded-full animate-spin" />
            
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">Autenticando</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estabelecendo conexão segura com o painel administrativo...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col md:flex-row bg-[#060813] font-sans selection:bg-[#F5C400]/30 selection:text-white overflow-x-hidden">
        {/* Coluna Esquerda - Banner Gráfico Premium com Imagem de Fundo */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 border-r border-white/[0.03] relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.png')" }}>
        {/* Overlay escuro com opacidade para transparência e legibilidade da imagem */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060813]/92 via-[#0b0e17]/88 to-[#060813]/92 z-0" />
        
        {/* Efeito Glow / Círculos de luz desfocados */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F5C400]/8 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        
        {/* Topo - Brand / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="Aptrade" className="h-10 w-auto object-contain" />
          <div className="border-l border-white/15 pl-3">
            <p className="text-[9px] font-bold text-[#F5C400] uppercase tracking-widest">
              Administrador
            </p>
          </div>
        </div>

        {/* Meio - Chamada de Conteúdo */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Painel Integrado de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5C400] to-[#DF9A00]">Administração</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Monitore a captação de recursos, gerencie fluxos de leads do CRM, controle os lotes de importação e acompanhe os indicadores de rentabilidade com máxima segurança.
            </p>
          </div>

          {/* Benefícios rápidos */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Check size={12} />
              </div>
              <span className="text-xs font-medium text-slate-200">Auditoria CVM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Check size={12} />
              </div>
              <span className="text-xs font-medium text-slate-200">Margens em Tempo Real</span>
            </div>
          </div>
        </div>

        {/* Rodapé - Footer */}
        <div className="relative z-10 flex justify-between items-center text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} APTRADE.</span>
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-emerald-500" />
            Conexão Segura SSL
          </span>
        </div>
      </div>

      {/* Coluna Direita - Formulário de Login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-[#060813] relative">
        {/* Glow de fundo móvel */}
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-[#F5C400]/3 rounded-full blur-[100px] md:hidden pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Logo exibido apenas no Mobile */}
          <div className="flex items-center gap-2.5 md:hidden mb-8">
            <img src="/logo.png" alt="Aptrade" className="h-9 w-auto object-contain" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">LOGIN</h1>
            <p className="text-sm text-slate-400">Insira suas credenciais de administrador</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-xl text-sm leading-relaxed flex items-start gap-2.5 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Nome de Usuário / E-mail
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-0 text-slate-600 group-focus-within:text-[#F5C400] transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-7 pr-0 py-3 bg-transparent border-0 border-b border-white/[0.12] focus:border-[#F5C400] focus:ring-0 focus:outline-none rounded-none text-sm text-white placeholder-slate-600 transition-colors duration-300"
                  placeholder="admin@aptrade.com.br"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Senha
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-0 text-slate-600 group-focus-within:text-[#F5C400] transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-7 pr-0 py-3 bg-transparent border-0 border-b border-white/[0.12] focus:border-[#F5C400] focus:ring-0 focus:outline-none rounded-none text-sm text-white placeholder-slate-600 transition-colors duration-300"
                  placeholder="••••••••"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-400 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full shimmer-premium-btn bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black py-3.5 px-4 rounded-xl text-sm font-bold tracking-wider hover:shadow-[0_4px_25px_rgba(245,196,0,0.22)] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Entrando..." : "LOGIN"}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-white/[0.05] space-y-4">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full py-3 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-xs font-semibold text-[#F5C400] active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              Preencher dados de demonstração
            </button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors">
                <ArrowLeft size={12} />
                Voltar ao login de investidor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

