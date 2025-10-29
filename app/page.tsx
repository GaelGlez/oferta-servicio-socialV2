"use client";

import { Button } from "@nextui-org/react";
import { Leaf, Sun } from "lucide-react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

/*
Valores posibles de period:
"verano" | "ago-dic" | "invierno" | "feb-jun"
*/

type PeriodKey = "invierno" | "feb-jun";

const periodOptions: Array<{
  label: string;
  label2?: string;
  value: PeriodKey;
  hours: number[];
  variant: "green" | "orange";
  icon: "sun" | "leaf";
}> = [
  {
    label: "VERANO",
    label2: undefined,
    value: "invierno", // ajusta si tu query difiere
    hours: [60, 100, 200],
    variant: "green",
    icon: "sun",
  },
  {
    label: "AGOSTO",
    label2: "DICIEMBRE",
    value: "feb-jun", // ajusta si tu query difiere
    hours: [60, 120, 180],
    variant: "orange",
    icon: "leaf",
  },
];

// Gradientes fijos para Tailwind (evita clases dinámicas)
const gradientByVariant: Record<"green" | "orange", string> = {
  green: "bg-gradient-to-br from-lime-200 via-lime-300 to-lime-500",
  orange: "bg-gradient-to-br from-orange-200 via-orange-300 to-orange-500",
};

function PeriodCard({
  titleTop,
  titleBottom,
  hrefHoursParam, // p.ej. "invierno"
  hours,
  variant,
  icon,
}: {
  titleTop: string;
  titleBottom?: string;
  hrefHoursParam: PeriodKey;
  hours: number[];
  variant: "green" | "orange";
  icon: "sun" | "leaf";
}) {
  const router = useRouter();

  return (
    <div
      className={`
        relative m-6 w-full sm:w-[460px] aspect-[1/1]
        rounded-xl border border-neutral-300
        shadow-[0_6px_24px_rgba(0,0,0,.08)] overflow-hidden
      `}
    >
      {/* Fondo degradado */}
      <div className={`absolute inset-0 ${gradientByVariant[variant]}`} />

      {/* Contenido */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between p-6">
        {/* Títulos */}
        <div className="mt-2 text-center">
          <p className="text-xl md:text-2xl font-extrabold tracking-widest">
            {titleTop}
          </p>
          {titleBottom && (
            <p className="text-lg md:text-xl -mt-1 font-extrabold tracking-widest">
              {titleBottom}
            </p>
          )}
        </div>

        {/* Ícono */}
        <div className="flex items-center justify-center">
          {icon === "sun" ? (
            <Sun className="h-28 w-28 opacity-80" />
          ) : (
            <Leaf className="h-28 w-28 opacity-80" />
          )}
        </div>

        {/* Botones “pastilla” oscuros */}
        <div className="mb-2 flex items-center gap-2">
          {hours.map((h) => (
            <button
              key={h}
              onClick={() =>
                router.push(`/catalogo?hours=Hasta+${h}&period=${hrefHoursParam}`)
              }
              className="
                rounded-full bg-neutral-900 px-4 py-1.5 text-white text-sm
                shadow-md transition-colors hover:bg-black
              "
            >
              {h} hrs
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageContent() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-10 text-center text-4xl md:text-6xl font-extrabold">
        Ofertas Servicio Social
      </h1>

      <div className="grid grid-cols-1 place-items-center gap-6 md:grid-cols-2">
        {periodOptions.map((p) => (
          <PeriodCard
            key={p.value}
            titleTop={p.label}
            titleBottom={p.label2}
            hrefHoursParam={p.value}
            hours={p.hours}
            variant={p.variant}
            icon={p.icon}
          />
        ))}
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
