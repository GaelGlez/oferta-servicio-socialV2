"use client"

import { Button } from "@nextui-org/react";
import { LeafyGreen, Sun } from "lucide-react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

const periodOptions = [
  {
    label: "PERIODO INTENSIVO",
    label2: "Invierno",
    value: "invierno",
    hours: [60, 100, 200],
    colorFrom: "lime-200",
    colorTo: "lime-500",
    icon: <Sun className="size-32" />,
  },
  {
    label: "PERIODO SEMESTRAL",
    label2: "Febrero - Junio",
    value: "feb-jun",
    hours: [60, 120, 180],
    colorFrom: "orange-200",
    colorTo: "orange-500",
    icon: <LeafyGreen className="size-32" />,
  },
];

/* 
Opciones de value
"verano"
"ago-dic"
"invierno"
"feb-jun"
*/

function PageContent() {
  const router = useRouter();

    return (
    <main className="flex min-h-screen flex-col px-4 lg:px-20 py-10 items-center">
      <h1 className="text-5xl font-bold py-5">Ofertas Servicio Social</h1>
      <div className="flex flex-col md:flex-row md:space-x-10">
        {periodOptions.map((period) => (
          <div
            key={period.value}
            className={`m-10 p-4 size-80 lg:size-96 rounded border-black border-2 bg-gradient-to-br from-${period.colorFrom} to-${period.colorTo}`}
          >
            <div className="flex flex-col items-center h-full justify-between">
              <div className="flex flex-col items-center gap-0.3">
                <h2 className="text-2xl font-mono font-bold text-center">{period.label}</h2>
                <h2 className="text-xl font-mono font-semibold">{period.label2}</h2>
              </div>
              {period.icon}
              <div className="flex flex-row gap-2 mt-4">
                {period.hours.map((h) => (
                  <Button
                    key={h}
                    color="primary"
                    radius="full"
                    size="sm"
                    onClick={() =>
                      router.push(`/catalogo?hours=Hasta+${h}&period=${period.value}`)
                    }
                  >
                    {h} hrs
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
