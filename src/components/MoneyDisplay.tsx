import { formatBRL } from "@/lib/calculations";

export function MoneyDisplay({
  value,
  positive = false,
  size = "md",
}: {
  value: number;
  positive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const formatted = formatBRL(value);
  const clean = formatted.replace("R$", "").replace(/ /g, " ").trim();
  const parts = clean.split(",");
  const integer = parts[0];
  const decimal = parts[1] ? `,${parts[1]}` : "";

  const sizeMap = {
    sm: { prefix: "text-[9px]", main: "text-sm", decimal: "text-[9px]" },
    md: { prefix: "text-xs", main: "text-base", decimal: "text-[10px]" },
    lg: { prefix: "text-sm", main: "text-xl", decimal: "text-xs" },
  };
  const s = sizeMap[size];

  return (
    <span
      className={`flex items-baseline font-bold tracking-tight ${
        positive ? "text-emerald-600" : "text-gray-900"
      }`}
    >
      <span className={`${s.prefix} font-semibold text-gray-400 mr-0.5 self-center`}>R$</span>
      <span className={`${s.main} font-extrabold`}>{integer}</span>
      {decimal && (
        <span className={`${s.decimal} font-medium text-gray-400 ml-0.5`}>{decimal}</span>
      )}
    </span>
  );
}
