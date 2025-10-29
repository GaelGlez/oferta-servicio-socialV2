"use client";

import { Calendar, Snowflake } from "lucide-react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

/*
Valores posibles de period:
"verano" | "ago-dic" | "invierno" | "feb-jun"
*/

type PeriodKey = "invierno" | "feb-jun";

// Nuevos periodos
const periodOptions: Array<{
  label: string;
  label2?: string;
  value: PeriodKey;
  hours: number[];
  variant: "green" | "orange"; // usamos estas 2 variantes
  icon: "snowflake" | "calendar";
}> = [
  {
    label: "INVierno", // si quieres en mayúsculas, puedes dejar "INVIERNO"
    value: "invierno",
    hours: [60, 100, 200],
    variant: "green",
    icon: "snowflake",
  },
  {
    label: "FEBRERO",
    label2: "JUNIO",
    value: "feb-jun",
    hours: [60, 120, 180],
    variant: "orange",
    icon: "calendar",
  },
];

// Gradientes por variante (coinciden con las claves anteriores)
const gradientByVariant: Record<"green" | "orange", string> = {
  green: "bg-gradient-to-br from-lime-200 via-lime-300 to-lime-500",
  orange: "bg-gradient-to-br from-orange-200 via-orange-300 to-orange-500",
};

function PeriodCard({
  titleTop,
  titleBottom,
  hrefHoursParam,
  hours,
  variant,
  icon,
}: {
  titleTop: string;
  titleBottom?: string;
  hrefHoursParam: PeriodKey;
  hours: number[];
  variant: "green" | "orange"; // <- corregido
  icon: "snowflake" | "calendar";
}) {
  const router = useRouter();

  return (
    <div
      className="
        relative m-6 w-full sm:w-[460px] aspect-[1/1]
        rounded-xl border border-neutral-300
        shadow-[0_6px_24px_rgba(0,0,0,.08)] overflow-hidden
      "
    >
      {/* Fondo degradado */}
      <div className={`absolute inset-0 ${gradientByVariant[variant]}`} />

      {/* Contenido */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between p-6">
        {/* Títulos: mismos estilos para ambos renglones */}
        <div className="mt-2 text-center leading-tight">
          <p className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest">
            {titleTop}
          </p>
          {titleBottom && (
            <p className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest -mt-1">
              {titleBottom}
            </p>
          )}
        </div>

        {/* Ícono */}
        <div className="flex items-center justify-center">
          {icon === "snowflake" ? (
            <Snowflake className="h-28 w-28 opacity-80" />
          ) : (
            <Calendar className="h-28 w-28 opacity-80" />
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
        Ofertas Servicio Social 2026
      </h1>

      <div className="grid grid-cols-1 place-items-center gap-6 md:grid-cols-2">
        {periodOptions.map((p) => (
          <PeriodCard
            key={p.value}
            titleTop={p.label}
            titleBottom={p.label2}
            hrefHoursParam={p.value}
            hours={p.hours}
            variant={p.variant}   // ahora coincide con el tipo
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
