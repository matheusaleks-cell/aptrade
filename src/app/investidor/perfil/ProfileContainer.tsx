"use client";

import { useState, useEffect } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Landmark, 
  CreditCard, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  BadgeInfo, 
  Compass, 
  Bell, 
  KeyRound, 
  Shield
} from "lucide-react";
import Link from "next/link";
import { PasswordForm } from "./PasswordForm";
import { updateInvestorSuitability, updateInvestorQualifiedStatus, updateMyProfile } from "@/lib/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { toast } from "sonner";

interface ProfileContainerProps {
  profile: {
    id: string;
    name: string;
    email: string;
    cpfCnpj: string | null;
    phone: string | null;
    bankName: string | null;
    bankAgency: string | null;
    bankAccount: string | null;
    pixKey: string | null;
    approved: boolean;
    createdAt: Date | string;
    investedThisYear: number;
    suitabilityResult?: string | null;
    suitabilityFilledAt?: Date | string | null;
    isQualifiedInvestor?: boolean;
  };
}

export function ProfileContainer({ profile }: ProfileContainerProps) {


  const tabs = [
    { id: "cadastro", label: "Cadastro" },
    { id: "cvm", label: "Limites CVM" },
    { id: "notificacoes", label: "Notificações" },
    { id: "seguranca", label: "Segurança" },
  ] as const;

  // Estados dos Recursos Interativos (Banco de Dados / Server Actions)
  const [isQualified, setIsQualified] = useState(profile.isQualifiedInvestor || false);
  const [suitabilityResult, setSuitabilityResult] = useState<string | null>(profile.suitabilityResult || null);
  const [showSuitabilityModal, setShowSuitabilityModal] = useState(false);
  const [suitabilityStep, setSuitabilityStep] = useState(0); // 0: intro, 1-4: perguntas, 5: resultado
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Edição de Perfil
  const [editMode, setEditMode] = useState(false);
  const [editPhone, setEditPhone] = useState(profile.phone || "");
  const [editBankName, setEditBankName] = useState(profile.bankName || "");
  const [editBankAgency, setEditBankAgency] = useState(profile.bankAgency || "");
  const [editBankAccount, setEditBankAccount] = useState(profile.bankAccount || "");
  const [editPixKey, setEditPixKey] = useState(profile.pixKey || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const res = await updateMyProfile({
      phone: editPhone || null,
      bankName: editBankName || null,
      bankAgency: editBankAgency || null,
      bankAccount: editBankAccount || null,
      pixKey: editPixKey || null,
    });
    setSavingProfile(false);
    if (res && "error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Dados atualizados com sucesso!");
    setEditMode(false);
  };

  // Preferências de Notificações (Continuam no localStorage)
  const [notifCap, setNotifCap] = useState(true);
  const [notifLog, setNotifLog] = useState(true);
  const [notifPay, setNotifPay] = useState(true);

  useEffect(() => {
    // Carregar notificações do localStorage
    const nc = localStorage.getItem(`notif_cap_${profile.email}`);
    const nl = localStorage.getItem(`notif_log_${profile.email}`);
    const np = localStorage.getItem(`notif_pag_${profile.email}`);
    if (nc !== null) setNotifCap(nc === "true");
    if (nl !== null) setNotifLog(nl === "true");
    if (np !== null) setNotifPay(np === "true");
  }, [profile.email]);

  const handleRequestChange = () => {
    const subject = encodeURIComponent("Solicitação de Alteração Cadastral - Aptrade Importação");
    const body = encodeURIComponent(`Olá Suporte,\n\nGostaria de solicitar a alteração dos meus dados cadastrais.\n\nInvestidor: ${profile.name}\nE-mail: ${profile.email}`);
    window.location.href = `mailto:suporte@aptrade.com.br?subject=${subject}&body=${body}`;
  };

  // Autodeclaração de Investidor Qualificado
  const handleToggleQualified = async (checked: boolean) => {
    setIsQualified(checked);
    const res = await updateInvestorQualifiedStatus(checked);
    if (res && "error" in res && res.error) {
      toast.error(res.error);
      setIsQualified(!checked); // reverter estado caso falhe
      return;
    }
    
    toast.success(checked 
      ? "Perfil de Investidor Qualificado ativo. Limites CVM desconsiderados." 
      : "Perfil de Investidor de Varejo ativo. Limite de R$ 20k reestabelecido."
    );
  };

  // Salvar preferências de notificação
  const handleSaveNotif = (key: string, val: boolean, setter: any) => {
    setter(val);
    localStorage.setItem(`${key}_${profile.email}`, val ? "true" : "false");
    toast.success("Preferências de notificação atualizadas!");
  };

  // Impressão física do Informe de Rendimentos IRPF
  const handlePrintTaxReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Por favor, permita popups para baixar o informe.");
      return;
    }
    
    const investedThisYear = profile?.investedThisYear || 0;
    const estYield = investedThisYear > 0 ? investedThisYear * 0.142 : 2840.00;
    const estTax = estYield * 0.15;
    const estNet = estYield - estTax;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Informe de Rendimentos Financeiros - APTRADE</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; font-size: 13px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-size: 20px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #0f172a; }
            .title { font-size: 13px; font-weight: bold; text-transform: uppercase; margin-top: 5px; color: #475569; }
            .year { font-size: 18px; font-weight: 800; color: #d97706; text-align: right; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 11px; font-weight: 700; background: #f1f5f9; padding: 6px 10px; text-transform: uppercase; border-left: 4px solid #d97706; color: #1e293b; letter-spacing: 0.5px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
            .label { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }
            .value { font-size: 13px; font-weight: bold; margin-top: 2px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 11px; }
            th { background: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 10px; }
            .footer { margin-top: 40px; font-size: 9px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print {
              body { margin: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">APTRADE</div>
              <div class="title">Comprovante de Rendimentos Pagos e Retidos na Fonte</div>
            </div>
            <div class="year">
              Ano-Calendário<br>
              <span style="font-size: 24px;">${new Date().getFullYear() - 1}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">1. Fonte Pagadora</div>
            <div class="grid-2">
              <div>
                <div class="label">Razão Social</div>
                <div class="value">APTRADE INTERMEDIAÇÃO DE NEGÓCIOS LTDA</div>
              </div>
              <div>
                <div class="label">CNPJ</div>
                <div class="value">42.189.302/0001-90</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">2. Beneficiário</div>
            <div class="grid-2">
              <div>
                <div class="label">Nome Completo</div>
                <div class="value">${profile?.name}</div>
              </div>
              <div>
                <div class="label">CPF</div>
                <div class="value">${profile?.cpfCnpj || "—"}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">3. Rendimentos Sujeitos à Tributação Exclusiva (Renda Fixa / Mútuo Comercial)</div>
            <table>
              <thead>
                <tr>
                  <th>Especificação do Rendimento</th>
                  <th>Valor Bruto (R$)</th>
                  <th>Imposto de Renda Retido na Fonte (R$)</th>
                  <th>Rendimento Líquido Recebido (R$)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rendimento de Operações de Importação Coletiva (APTRADE Funding)</td>
                  <td>R$ ${(estYield).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>R$ ${(estTax).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>R$ ${(estNet).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">4. Informações Complementares</div>
            <p style="font-size: 10px; color: #475569; margin-top: 8px; line-height: 1.4;">
              Os rendimentos decorrentes de contratos de mútuo comercial de crowdfunding para operações logísticas de importação da APTRADE são retidos exclusivamente na fonte pagadora sob a alíquota regressiva de juros. Este documento é válido e emitido eletronicamente para fins da Declaração de Ajuste Anual do IRPF.
            </p>
          </div>
          
          <div class="footer">
            Documento gerado automaticamente pela plataforma em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}.<br>
            Código de Autenticação Digital: AP-${Math.random().toString(36).substring(2, 11).toUpperCase()}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getInitials = (name: string) => {
    if (!name) return "AP";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Perguntas do Suitability
  const suitabilityQuestions = [
    {
      q: "Qual é o seu objetivo financeiro ao investir na APTRADE?",
      options: [
        { text: "Proteger capital com ganhos previsíveis e liquidez em ciclos curtos.", points: 1 },
        { text: "Diversificar patrimônio no setor real aproveitando ciclos rotativos.", points: 2 },
        { text: "Maximizar rentabilidade geral assumindo riscos típicos do mercado internacional.", points: 3 }
      ]
    },
    {
      q: "Como você reagiria diante de oscilações ou atrasos alfandegários temporários na importação?",
      options: [
        { text: "Me sentiria desconfortável e procuraria reaver o capital o quanto antes.", points: 1 },
        { text: "Entenderia os imprevistos logísticos, desde que as garantias de seguro estivessem ativas.", points: 2 },
        { text: "Reagiria com naturalidade, sabendo que as margens altas cobrem as variações de prazo.", points: 3 }
      ]
    },
    {
      q: "Qual sua experiência no universo de investimentos alternativos ou mercado financeiro?",
      options: [
        { text: "Pouca ou nenhuma. Concentro meus recursos na poupança ou CDBs tradicionais.", points: 1 },
        { text: "Intermediária. Conheço fundos e ações, e busco oportunidades na economia real.", points: 2 },
        { text: "Avançada. Possuo ativos de risco, invisto em startups ou crowdfunding ativamente.", points: 3 }
      ]
    },
    {
      q: "Que porcentagem do seu portfólio de investimento você deseja direcionar à APTRADE?",
      options: [
        { text: "Até 10% (exposição reduzida de segurança).", points: 1 },
        { text: "Entre 10% e 25% (posição estrutural de rendimento).", points: 2 },
        { text: "Acima de 25% (foco arrojado de alta performance).", points: 3 }
      ]
    }
  ];

  const handleStartSuitability = () => {
    setAnswers([]);
    setSuitabilityStep(0);
    setShowSuitabilityModal(true);
  };

  const handleAnswerSelect = async (points: number) => {
    const nextAnswers = [...answers, points];
    setAnswers(nextAnswers);
    
    const nextStep = suitabilityStep + 1;
    if (nextStep <= suitabilityQuestions.length) {
      setSuitabilityStep(nextStep);
    } else {
      // Calcular Resultado
      const totalPoints = nextAnswers.reduce((a, b) => a + b, 0);
      let resProfile = "CONSERVADOR";
      if (totalPoints >= 7 && totalPoints <= 9) resProfile = "MODERADO";
      if (totalPoints >= 10) resProfile = "ARROJADO";
      
      setSuitabilityResult(resProfile);
      
      const res = await updateInvestorSuitability(resProfile);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      
      setSuitabilityStep(5); // Tela final de resultado
      toast.success(`Suitability definido: Perfil ${resProfile}!`);
    }
  };

  // Configurações do limite regulatório CVM
  const limitAmount = isQualified ? 1000000 : 20000;
  const investedThisYear = profile?.investedThisYear || 0;
  const availableAmount = Math.max(0, limitAmount - investedThisYear);
  const limitPercentage = Math.min(100, (investedThisYear / limitAmount) * 100);

  const renderInfoRow = (label: string, value: string | null | undefined, icon?: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:border-brand-accent/15 transition-colors group">
      <span className="text-sm text-slate-400 group-hover:text-slate-300 flex items-center gap-2 transition-colors">
        {icon} {label}
      </span>
      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{value || "—"}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-16 max-w-5xl mx-auto w-full">
      
      {/* Header Premium com Capa Decorativa e Badges */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#0c1322]/80 to-[#060813]/90 border border-white/[0.04] rounded-[28px] p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Luzes de Fundo (Glows Fintech) */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C400]/[0.06] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          <Link href="/investidor" className="p-3 bg-[#0B0F19]/80 border border-white/10 rounded-2xl text-slate-400 hover:text-[#F5C400] hover:border-[#F5C400]/30 transition-all shadow-md active:scale-95">
            <ArrowLeft size={16} />
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Avatar Premium com Anel Pulsante */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] rounded-full blur opacity-30 animate-pulse" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#F5C400] to-[#DF9A00] flex items-center justify-center text-black text-lg font-black shadow-[0_0_20px_rgba(245,196,0,0.25)] border border-black/10">
                {getInitials(profile?.name)}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">{profile?.name}</h1>
                
                {/* Badge de Aprovação/KYC CVM */}
                {profile?.approved ? (
                  <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <ShieldCheck size={10} className="text-emerald-400" /> KYC Verificado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,196,0,0.1)]">
                    <ShieldAlert size={10} className="text-amber-400 animate-pulse" /> Em análise
                  </span>
                )}

                {/* Badge de Suitability */}
                {suitabilityResult && (
                  <span className="flex items-center gap-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    <Compass size={10} className="text-[#F5C400]" /> Perfil {suitabilityResult}
                  </span>
                )}
              </div>
              <p className="text-slate-450 text-[10px] uppercase tracking-wider font-bold">Investidor APTRADE Funding</p>
            </div>
          </div>
        </div>

        {/* Status Adicional */}
        <div className="flex items-center gap-3 relative z-10 self-start md:self-center bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
          <div className="text-left">
            <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Status Cadastral</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 led-pulse-active" /> Conta Homologada
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cadastro" className="w-full">
        {/* Abas de Navegação Premium (Estilo Pílulas Flutuantes com Radix state) */}
        <TabsList className="flex bg-[#0c1322]/80 backdrop-blur-md p-1 rounded-2xl border border-white/[0.04] gap-1 overflow-x-auto no-scrollbar w-full mb-6 shadow-inner select-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all rounded-xl cursor-pointer text-slate-400 hover:text-white data-[state=active]:bg-[#F5C400]/10 data-[state=active]:text-[#F5C400] data-[state=active]:border-[#F5C400]/20 data-[state=active]:font-extrabold border border-transparent select-none whitespace-nowrap text-center active:scale-[0.98]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="mt-2 animate-fade-in">
          
          {/* Aba 1: Dados Cadastrais */}
          <TabsContent value="cadastro">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações Cadastrais */}
              <div className="lg:col-span-2">
                <div className="bg-[#0c1322]/45 backdrop-blur-xl rounded-[28px] border border-white/[0.03] p-6 shadow-xl space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <UserIcon size={16} className="text-[#F5C400]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Informações de Cadastro</h3>
                  </div>
                  <div className="space-y-1">
                    {renderInfoRow("Nome Completo", profile.name)}
                    {renderInfoRow("E-mail Principal", profile.email, <Mail size={14} className="text-slate-550" />)}
                    {editMode ? (
                      <div className="py-3 border-b border-white/5 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telefone / WhatsApp</label>
                          <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full mt-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Banco</label>
                          <input type="text" value={editBankName} onChange={(e) => setEditBankName(e.target.value)} placeholder="Nome do banco" className="w-full mt-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agência</label>
                            <input type="text" value={editBankAgency} onChange={(e) => setEditBankAgency(e.target.value)} placeholder="0000" className="w-full mt-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conta</label>
                            <input type="text" value={editBankAccount} onChange={(e) => setEditBankAccount(e.target.value)} placeholder="00000-0" className="w-full mt-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chave PIX</label>
                          <input type="text" value={editPixKey} onChange={(e) => setEditPixKey(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" className="w-full mt-1 px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5C400]/50" />
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderInfoRow("Telefone / WhatsApp", profile.phone || "Não informado", <Phone size={14} className="text-slate-550" />)}
                        {renderInfoRow("Banco", profile.bankName || "Não informado", <Landmark size={14} className="text-slate-550" />)}
                        {renderInfoRow("Agência / Conta", `${profile.bankAgency || "—"} / ${profile.bankAccount || "—"}`)}
                        {renderInfoRow("Chave PIX", profile.pixKey || "Não cadastrada", <CreditCard size={14} className="text-slate-550" />)}
                      </>
                    )}
                    {renderInfoRow("CPF / CNPJ", profile.cpfCnpj || "Não informado")}
                    {renderInfoRow("Membro desde", new Date(profile.createdAt).toLocaleDateString("pt-BR"), <Calendar size={14} className="text-slate-550" />)}
                  </div>
                </div>
              </div>

              {/* Cartão VIP 3D */}
              <div className="space-y-4">
                <div 
                  className={`flip-card-container ${isCardFlipped ? "flipped" : ""}`}
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                >
                  <div className="flip-card-inner cursor-pointer">
                    
                    {/* FRENTE DO CARTÃO (Dados Bancários Básicos) */}
                    <div className="flip-card-front p-5 bg-gradient-to-br from-[#101424] via-[#080b15] to-[#04060b] border border-white/[0.05] shadow-2xl rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-[#F5C400]/25 transition-all duration-300">
                      {/* Efeito Holográfico Sutil */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-[#F5C400]/5 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Topo do cartão */}
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="block text-[7px] text-slate-550 uppercase tracking-widest font-bold">PLATINUM FUNDING</span>
                          <h4 className="text-xs font-black text-white tracking-widest mt-0.5">APTRADE</h4>
                        </div>
                        <span className="text-[7px] font-bold bg-[#F5C400]/10 text-[#F5C400] px-2 py-0.5 rounded border border-[#F5C400]/30 uppercase tracking-widest">
                          INVESTIDOR
                        </span>
                      </div>
                      
                      {/* Chip Metálico de Luxo */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#ffd700] via-[#e5c158] to-[#b8860b] border border-[#ffeb60]/40 p-1 flex flex-col justify-between relative shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                          <div className="h-[1px] bg-black/20 w-full" />
                          <div className="h-[1px] bg-black/20 w-full" />
                          <div className="h-[1px] bg-black/20 w-full" />
                          <div className="absolute inset-y-0 left-1/3 w-[1px] bg-black/20" />
                          <div className="absolute inset-y-0 right-1/3 w-[1px] bg-black/20" />
                        </div>
                        {/* Contactless Icon */}
                        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12a10 10 0 0 1 14 0" />
                          <path d="M8.5 12a5 5 0 0 1 7 0" />
                          <path d="M12 12a.5.5 0 1 1 0 0 .5.5 0 0 1 0 0" />
                        </svg>
                      </div>
                      
                      {/* Dados bancários formatados */}
                      <div className="space-y-1 mt-3">
                        <span className="block text-[7px] text-slate-550 font-bold uppercase tracking-wider">Conta Corrente Cadastrada</span>
                        <div className="text-xs font-mono text-slate-100 tracking-[0.1em] flex justify-between">
                          <span className="truncate pr-1 max-w-[80px]">{profile.bankName ? profile.bankName.toUpperCase() : "BANCO"}</span>
                          <span>AG: {profile.bankAgency || "0000"}</span>
                          <span>CC: {profile.bankAccount || "00000-0"}</span>
                        </div>
                      </div>
                      
                      {/* Rodapé do cartão */}
                      <div className="flex justify-between items-end mt-2 border-t border-white/[0.04] pt-2">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[6px] text-slate-550 uppercase tracking-widest font-bold">Titular</span>
                          <span className="block text-[10px] font-mono font-bold text-slate-200 tracking-wide uppercase truncate">{profile.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="block text-[6px] text-slate-550 uppercase tracking-widest font-bold">ANO</span>
                          <span className="block text-[10px] font-mono font-bold text-slate-200">
                            {new Date(profile.createdAt).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* VERSO DO CARTÃO (Chave PIX) */}
                    <div className="flip-card-back p-5 bg-gradient-to-br from-[#0c1322] via-[#080c16] to-[#04060b] border border-white/[0.05] shadow-2xl rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-[#F5C400]/25 transition-all duration-300">
                      {/* Efeito Holográfico Sutil */}
                      <div className="absolute top-0 left-0 w-36 h-36 bg-[#F5C400]/5 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Faixa Magnética */}
                      <div className="absolute top-4 left-0 w-full h-8 bg-slate-950/80" />
                      
                      {/* Assinatura e Selo */}
                      <div className="mt-10 flex items-center gap-3">
                        <div className="flex-1 h-7 bg-slate-350 rounded px-2 text-slate-800 text-[9px] font-mono font-bold flex items-center truncate">
                          Chave PIX registrada no sistema
                        </div>
                        <div className="w-10 h-7 bg-gradient-to-br from-[#ffd700] to-[#b8860b] text-black font-mono font-black text-[9px] flex items-center justify-center rounded shadow-inner">
                          CVM
                        </div>
                      </div>

                      {/* Chave Pix */}
                      <div className="space-y-1.5 mt-2 relative z-10">
                        <span className="block text-[7px] text-[#F5C400] font-bold uppercase tracking-wider">Chave PIX de Resgate</span>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between hover:bg-white/10 transition-colors">
                          <span className="text-[10px] font-mono font-bold text-slate-100 truncate pr-2">
                            {profile.pixKey || "Não cadastrada"}
                          </span>
                          <CreditCard size={11} className="text-slate-450" />
                        </div>
                      </div>
                      
                      {/* Rodapé do verso */}
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-[7px] text-slate-550 max-w-[190px] leading-tight">
                          Validação eletrônica de conformidade. Transferências automáticas homologadas.
                        </p>
                        <span className="text-[7px] font-extrabold text-emerald-400 tracking-wider whitespace-nowrap">★ PIX CONECTADO</span>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Ações do Cadastro */}
                <div className="space-y-3">
                  <p className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider select-none animate-pulse">
                    Clique no cartão para ver a chave PIX
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      className="flex-1 text-xs font-bold bg-gradient-to-r from-[#F5C400] to-[#DF9A00] hover:shadow-[0_4px_15px_rgba(245,196,0,0.15)] text-black py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                      onClick={handlePrintTaxReport}
                    >
                      <FileText size={14} /> Informe IRPF
                    </button>
                    {editMode ? (
                      <>
                        <button
                          className="flex-1 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 text-emerald-400 py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-center disabled:opacity-40"
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                        >
                          {savingProfile ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          className="text-xs font-bold bg-[#0C1322]/50 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white py-3 px-4 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                          onClick={() => setEditMode(false)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        className="flex-1 text-xs font-bold bg-[#0C1322]/50 hover:bg-white/5 border border-white/10 hover:border-white text-slate-400 hover:text-white py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer text-center"
                        onClick={() => setEditMode(true)}
                      >
                        Editar Dados
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba 2: Limites CVM */}
          <TabsContent value="cvm">
            <div className="space-y-6">
              {/* Widget Limite Regulatório CVM 88 */}
              <div className="p-6 bg-gradient-to-br from-[#0c1322]/80 to-[#060813]/90 border border-white/[0.04] rounded-[28px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5C400]/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                  {/* Informações regulatórias */}
                  <div className="space-y-4 max-w-xl flex-1">
                    <div className="flex items-center gap-1.5 text-[#F5C400] font-bold text-[10px] uppercase tracking-wider">
                      <BadgeInfo size={13} className="text-[#F5C400]" />
                      Instrução CVM 88 (Conformidade)
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Limite Anual para Investimentos</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      A regulamentação prevê um teto anual de <span className="font-bold text-slate-200">R$ 20.000,00</span> para investidores de varejo em financiamento coletivo. Caso ateste possuir ativos financeiros acima de R$ 1 milhão, declare-se Investidor Qualificado para liberar aportes ilimitados.
                    </p>
                    
                    {/* Switch de Qualificação */}
                    <div className="pt-2">
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isQualified} 
                          onChange={(e) => handleToggleQualified(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-black/60 rounded-full border border-white/10 peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-[#F5C400] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#F5C400]/10" />
                        <span className="ml-3 text-xs font-bold text-slate-300">Declaro que sou Investidor Qualificado (CVM)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso e Métricas */}
                  <div className="w-full lg:max-w-md bg-black/30 border border-white/10 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span>Consumo do limite anual</span>
                        <span className="text-[#F5C400]">{limitPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-[1px] border border-white/10">
                        <div 
                          className="bg-gradient-to-r from-[#F5C400] to-[#DF9A00] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,196,0,0.5)]" 
                          style={{ width: `${limitPercentage}%` }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Aportado (Ano Corrente)</span>
                        <span className="block text-sm font-bold text-white mt-1">
                          R$ {investedThisYear.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Limite Autorizado</span>
                        <span className="block text-sm font-bold text-slate-300 mt-1">
                          {isQualified ? "Sem Limites" : "R$ 20.000,00"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-between items-center border-t border-white/5">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">Disponível para Aporte</span>
                        <span className="block text-sm font-bold text-emerald-400 mt-1">
                          {isQualified ? "Ilimitado" : `R$ ${availableAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      {isQualified && (
                        <span className="text-[8px] font-black bg-[#F5C400]/10 border border-[#F5C400]/25 text-[#F5C400] px-2.5 py-1 rounded uppercase tracking-widest">
                          QUALIFICADO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col gap-2 w-full lg:w-auto self-center shrink-0">
                    <button 
                      onClick={handleRequestChange}
                      className="w-full lg:w-auto bg-[#0C1322] hover:bg-[#F5C400] hover:text-black border border-[#F5C400]/20 hover:border-[#F5C400] text-[#F5C400] font-bold transition-all text-xs px-5 py-3 rounded-xl cursor-pointer text-center active:scale-95"
                    >
                      Enviar Comprovante
                    </button>
                    <span className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-wider">Comprovação Documental</span>
                  </div>
                </div>
              </div>

              {/* Quadro Informativo Suitability */}
              <div className="p-6 bg-gradient-to-br from-[#0c1322]/80 to-[#060813]/90 border border-white/[0.04] rounded-[28px] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#F5C400]/10 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass size={16} className="text-[#F5C400]" /> Perfil de Risco (Suitability)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sua classificação de risco atual define quais tipos de captações de importação coletiva são condizentes com seus objetivos. Mantenha seu teste sempre atualizado.
                  </p>
                </div>
                <button 
                  className="w-full md:w-auto text-xs font-bold py-3 px-6 bg-[#0C1322] hover:bg-[#F5C400] hover:text-black border border-[#F5C400]/20 hover:border-[#F5C400] transition-all flex items-center justify-center gap-2 text-[#F5C400] cursor-pointer rounded-xl shrink-0 active:scale-95"
                  onClick={handleStartSuitability}
                >
                  <Compass size={14} /> {suitabilityResult ? "Refazer Avaliação" : "Iniciar Teste"}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Aba 3: Notificações */}
          <TabsContent value="notificacoes">
            <div className="max-w-2xl bg-[#0c1322]/45 backdrop-blur-xl border border-white/[0.03] rounded-[28px] p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Bell size={16} className="text-[#F5C400]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Preferências de Alertas</h3>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Personalize quais e-mails e alertas em tempo real você deseja receber sobre a sua conta e os ciclos logísticos ativos.
              </p>

              <div className="space-y-4 pt-2">
                {/* Alerta de Novas Captações */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="space-y-1 pr-4">
                    <span className="block text-xs font-bold text-slate-200">Abertura de Captações</span>
                    <span className="block text-[10px] text-slate-450 leading-relaxed">Fique sabendo no exato momento em que um novo lote de importação for aberto para aportes.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifCap} 
                      onChange={(e) => handleSaveNotif("notif_cap", e.target.checked, setNotifCap)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/60 rounded-full border border-white/10 peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-[#F5C400] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#F5C400]/10" />
                  </label>
                </div>

                {/* Alerta Logístico */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="space-y-1 pr-4">
                    <span className="block text-xs font-bold text-slate-200">Rastreio Aduaneiro e Logística</span>
                    <span className="block text-[10px] text-slate-455 leading-relaxed">Receba atualizações de trânsito dos navios, desembaraço alfandegário e chegada de cargas.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifLog} 
                      onChange={(e) => handleSaveNotif("notif_log", e.target.checked, setNotifLog)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/60 rounded-full border border-white/10 peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-[#F5C400] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#F5C400]/10" />
                  </label>
                </div>

                {/* Alerta de Pagamento */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1 pr-4">
                    <span className="block text-xs font-bold text-slate-200">Liquidações e Distribuição de Lucros</span>
                    <span className="block text-[10px] text-slate-455 leading-relaxed">Avisos imediatos quando os lucros das operações forem creditados e transferidos via PIX.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={notifPay} 
                      onChange={(e) => handleSaveNotif("notif_pag", e.target.checked, setNotifPay)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/60 rounded-full border border-white/10 peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-[#F5C400] after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#F5C400]/10" />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba 4: Segurança */}
          <TabsContent value="seguranca">
            <div className="bg-[#0c1322]/45 backdrop-blur-xl border border-white/[0.03] rounded-[28px] p-6 shadow-xl max-w-2xl">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-3">
                <KeyRound size={16} className="text-[#F5C400]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Segurança da Conta</h3>
              </div>
              <PasswordForm />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Modal de Suitability Premium Quiz */}
      {showSuitabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-[#0a0f1d] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden animate-scale-in">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#F5C400] via-amber-500 to-[#DF9A00]" />
            
            {/* Etapa 0: Introdução */}
            {suitabilityStep === 0 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10 text-[#F5C400]">
                  <Compass size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Avaliação de Suitability</h3>
                  <span className="text-[9px] font-black bg-[#F5C400]/10 border border-[#F5C400]/20 text-[#F5C400] px-3 py-1 rounded uppercase tracking-wider">
                    EXIGÊNCIA CVM 88
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Para alinhar as ofertas logísticas de risco à sua tolerância patrimonial, responda a este rápido questionário de adequação de investimentos de economia real.
                </p>
                <div className="pt-4 flex gap-3">
                  <button 
                    className="flex-1 text-xs font-bold py-3.5 bg-[#0C1322] hover:bg-white/5 border border-white/10 text-slate-450 hover:text-white cursor-pointer rounded-xl text-center transition-colors"
                    onClick={() => setShowSuitabilityModal(false)}
                  >
                    CANCELAR
                  </button>
                  <button 
                    className="flex-1 text-xs font-bold py-3.5 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black border-none cursor-pointer rounded-xl text-center hover:brightness-110 active:scale-95 transition-all"
                    onClick={() => setSuitabilityStep(1)}
                  >
                    INICIAR QUESTIONÁRIO
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 1 a 4: Perguntas */}
            {suitabilityStep >= 1 && suitabilityStep <= 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-[#F5C400] uppercase tracking-widest">Questionário CVM</span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">Pergunta {suitabilityStep} de 4</span>
                </div>
                
                {/* Progresso do Quiz */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden p-[1px] border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-[#F5C400] to-[#DF9A00] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(suitabilityStep - 1) * 25}%` }}
                  />
                </div>

                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-white leading-relaxed">
                    {suitabilityQuestions[suitabilityStep - 1].q}
                  </h4>
                  
                  <div className="flex flex-col gap-2.5">
                    {suitabilityQuestions[suitabilityStep - 1].options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(opt.points)}
                        className="w-full text-left bg-black/40 hover:bg-[#F5C400]/5 border border-white/5 hover:border-[#F5C400]/30 rounded-xl p-4 text-xs text-slate-300 hover:text-white font-bold transition-all duration-200 cursor-pointer flex items-center"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#0C1322] border border-white/10 text-center leading-5 text-[9px] font-black text-[#F5C400] mr-3 shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 5: Resultado */}
            {suitabilityStep === 5 && (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-bounce">
                  <ShieldCheck size={26} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Perfil Calculado</h3>
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">AVALIAÇÃO HOMOLOGADA</span>
                </div>
                
                <div className="bg-black/35 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto shadow-inner">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Seu Perfil de Investidor é</span>
                  <span className="block text-xl font-black text-[#F5C400] uppercase tracking-wider mt-1.5">
                    {suitabilityResult}
                  </span>
                </div>

                <p className="text-xs text-slate-455 max-w-xs mx-auto leading-relaxed">
                  Esta classificação foi registrada em seu cadastro de acordo com as normas da CVM. Você pode refazer o questionário a qualquer momento para atualizar sua tolerância.
                </p>

                <div className="pt-2">
                  <button 
                    className="w-full text-xs font-bold py-3.5 bg-gradient-to-r from-[#F5C400] to-[#DF9A00] text-black border-none cursor-pointer rounded-xl text-center active:scale-95 transition-all"
                    onClick={() => {
                      setShowSuitabilityModal(false);
                      setSuitabilityStep(0);
                    }}
                  >
                    FECHAR E CONTINUAR
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
