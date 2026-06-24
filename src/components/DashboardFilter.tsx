"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectOption {
  id: string;
  name: string;
}

interface DashboardFilterProps {
  projects: ProjectOption[];
  selectedProjectId?: string;
  selectedPeriod?: string;
  startDate?: string;
  endDate?: string;
}

export function DashboardFilter({ 
  projects, 
  selectedProjectId, 
  selectedPeriod,
  startDate,
  endDate
}: DashboardFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toISODate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  };

  const handleProjectValueChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== "all") {
      params.set("project", val);
    } else {
      params.delete("project");
    }
    router.push(`/investidor?${params.toString()}`);
  };

  const handlePeriodValueChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    if (val && val !== "all") {
      params.set("period", val);
    } else {
      params.delete("period");
    }
    router.push(`/investidor?${params.toString()}`);
  };

  const handleDateSelect = (fieldName: "startDate" | "endDate", date: Date | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("period");
    if (date) {
      params.set(fieldName, toISODate(date));
    } else {
      params.delete(fieldName);
    }
    router.push(`/investidor?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Filtro por Projeto */}
      <Select value={selectedProjectId || "all"} onValueChange={handleProjectValueChange}>
        <SelectTrigger className="flex h-8 w-fit items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-2 pl-2.5 text-xs text-slate-200 transition-all duration-300 hover:border-[#F5C400]/40 outline-none select-none">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <SelectValue placeholder="Todos os Projetos" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#0C1322] border border-white/10 text-slate-200 text-xs">
          <SelectItem value="all" className="focus:bg-slate-800 text-slate-350">Todos os Projetos</SelectItem>
          {projects.map((proj) => (
            <SelectItem key={proj.id} value={proj.id} className="focus:bg-slate-800 text-slate-200">
              {proj.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro por Período Rápido */}
      <Select value={selectedPeriod || "all"} onValueChange={handlePeriodValueChange}>
        <SelectTrigger className="flex h-8 w-fit items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-2 pl-2.5 text-xs text-slate-200 transition-all duration-300 hover:border-[#F5C400]/40 outline-none select-none">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-slate-400" />
            <SelectValue placeholder="Todo o período" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-[#0C1322] border border-white/10 text-slate-200 text-xs">
          <SelectItem value="all" className="focus:bg-slate-800 text-slate-350">Todo o período</SelectItem>
          <SelectItem value="30" className="focus:bg-slate-800 text-slate-200">Últimos 30 dias</SelectItem>
          <SelectItem value="90" className="focus:bg-slate-800 text-slate-200">Últimos 90 dias</SelectItem>
          <SelectItem value="180" className="focus:bg-slate-800 text-slate-200">Últimos 180 dias</SelectItem>
          <SelectItem value="year" className="focus:bg-slate-800 text-slate-200">Este ano</SelectItem>
        </SelectContent>
      </Select>

      {/* Filtro Data Inicial */}
      <Popover>
        <PopoverTrigger
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-8 text-slate-200 text-xs font-medium hover:border-[#F5C400]/40 hover:bg-white/5 cursor-pointer outline-none"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">De:</span>
          <span>{startDate ? format(new Date(startDate + "T00:00:00"), "dd/MM/yyyy") : "Selecionar"}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0C1322] border border-white/10" align="start">
          <Calendar
            mode="single"
            selected={startDate ? new Date(startDate + "T00:00:00") : undefined}
            onSelect={(date) => handleDateSelect("startDate", date)}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Filtro Data Final */}
      <Popover>
        <PopoverTrigger
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-8 text-slate-200 text-xs font-medium hover:border-[#F5C400]/40 hover:bg-white/5 cursor-pointer outline-none"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">Até:</span>
          <span>{endDate ? format(new Date(endDate + "T00:00:00"), "dd/MM/yyyy") : "Selecionar"}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0C1322] border border-white/10" align="start">
          <Calendar
            mode="single"
            selected={endDate ? new Date(endDate + "T00:00:00") : undefined}
            onSelect={(date) => handleDateSelect("endDate", date)}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
