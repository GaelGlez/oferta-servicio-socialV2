{/* Flipbook */}
<div className="relative w-full md:w-auto max-w-[1100px] md:max-w-none select-none overflow-hidden mx-auto">
  <HTMLFlipBook
    ref={bookRef}
    key={`${searchTerm}-${selectedHours}-${selectedTags}-${selectedModel}-${selectedPeriod}`}

    /* ===== tamaño/control por dispositivo ===== */
    size={isMobile ? "stretch" : "fixed"}
    autoSize={!isMobile}                 // en desktop, respeta width/height fijos
    width={isMobile ? 1100 : 1200}       // ancho página en desktop
    height={isMobile ? 1558 : 1700}      // alto página en desktop
    minWidth={isMobile ? 320 : 960}      // mínimo para desktop -> evita verse chico
    maxWidth={isMobile ? 1600 : 1400}
    minHeight={isMobile ? 520 : 800}
    maxHeight={isMobile ? 2200 : 2000}

    showCover
    usePortrait
    maxShadowOpacity={0.5}
    drawShadow
    startPage={0}

    // interacción
    disableFlipByClick={isMobile}
    useMouseEvents={!isMobile}
    swipeDistance={isMobile ? 999 : 50}
    clickEventForward={false}
    mobileScrollSupport={true}

    className="shadow-xl z-10"
    showPageCorners
    onInit={(inst: any) => { try { syncFromApi(inst?.pageFlip?.()); } catch {} }}
    onFlip={() => { syncFromApi(); }}
  >
    {/* ...páginas... */}
  </HTMLFlipBook>

  {/* barra inferior móvil se queda igual */}
  <div className="md:hidden w-full">
    {/* ...tus botones... */}
  </div>
</div>
