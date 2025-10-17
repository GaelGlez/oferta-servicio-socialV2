'use client';

import React, { Suspense } from "react";
import CatalogoMagazineContent from "./CatalogoMagazineContent";

export default function CatalogoMagazinePage() {
  return (
    <Suspense fallback={<div>Cargando catálogo...</div>}>
      <CatalogoMagazineContent />
    </Suspense>
  );
}
