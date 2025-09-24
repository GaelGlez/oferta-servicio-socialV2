'use client';

import React, { useRef } from 'react';
import HTMLFlipBookLib from 'react-pageflip';
const HTMLFlipBook = HTMLFlipBookLib as any;

export default function DemoFlip() {
    const book = useRef<any>(null);

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <HTMLFlipBook
                width={500}
                height={700}
                maxShadowOpacity={0.5}
                drawShadow={true}
                showCover={true}
                size="fixed"
                //minWidth={300}
                //maxWidth={800}
                //minHeight={400}
                //maxHeight={1000}
                //startPage={0}
                //flippingTime={1000}
                //className="shadow-xl"
                //ref={book}
            >
                <div className="page" style={{ background: 'transparent' }}>
                    <div className="page-content cover">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg"
                            alt="Pokémon Logo"
                            className="pokemon-logo"
                        />
                    </div>
                </div>

                <div className="p-10 bg-blue-200">Página 2</div>
                <div className="p-10 bg-green-200">Página 3</div>
                <div className="p-10 bg-pink-200">Página 4</div>
            </HTMLFlipBook>
        </div>
    );
}
