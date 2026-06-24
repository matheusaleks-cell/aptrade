"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateMyPassword } from "@/lib/actions";
import { Input } from "@/components/ui/input";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordForm() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    const result = await updateMyPassword(formData);
    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error ?? "Erro desconhecido" });
    } else {
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      reset();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Senha Atual
        </label>
        <Input
          type="password"
          {...register("currentPassword")}
          className="w-full h-10 px-4 py-2.5 bg-white dark:bg-[#060813] border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-950 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-[#F5C400]/30 focus:border-amber-500 dark:focus:border-[#F5C400]/40 transition-all duration-300"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-400 font-semibold">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Nova Senha
        </label>
        <Input
          type="password"
          {...register("newPassword")}
          className="w-full h-10 px-4 py-2.5 bg-white dark:bg-[#060813] border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-950 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-[#F5C400]/30 focus:border-amber-500 dark:focus:border-[#F5C400]/40 transition-all duration-300"
        />
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-400 font-semibold">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Confirmar Nova Senha
        </label>
        <Input
          type="password"
          {...register("confirmPassword")}
          className="w-full h-10 px-4 py-2.5 bg-white dark:bg-[#060813] border border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-950 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:focus:ring-[#F5C400]/30 focus:border-amber-500 dark:focus:border-[#F5C400]/40 transition-all duration-300"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-400 font-semibold">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-[#F5C400] hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-bold rounded-xl text-sm transition-all duration-300 disabled:opacity-50 shadow-[0_4px_12px_rgba(245,196,0,0.15)] active:scale-[0.98] cursor-pointer text-center"
      >
        {loading ? "Alterando..." : "Alterar Senha"}
      </button>
    </form>
  );
}
