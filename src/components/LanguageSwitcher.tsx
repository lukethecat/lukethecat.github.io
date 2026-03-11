'use client';

export function LanguageSwitcher() {
    return (
        <div className="relative group bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-all duration-300 flex items-center min-w-[120px]">
            
            {/* The actual google translate element, styled to expand click area */}
            <div id="google_translate_element" className="w-full h-full"></div>
            
            {/* Absolute positioning for the globe icon so it doesn't interfere with the click target */}
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            
            <style jsx global>{`
                /* Hide Google Translate top bar */
                .goog-te-banner-frame.skiptranslate {
                    display: none !important;
                }
                body {
                    top: 0px !important;
                }
                
                #google_translate_element {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }

                .goog-te-gadget {
                    color: transparent !important;
                    font-size: 0px !important; 
                    display: flex;
                    width: 100%;
                    height: 100%;
                }

                .goog-te-gadget-simple {
                    background-color: transparent !important;
                    border: none !important;
                    /* Padding creates the full height/width hit area. Left padding for the absolute icon. */
                    padding: 8px 12px 8px 32px !important;
                    border-radius: 8px !important;
                    font-family: inherit !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer !important;
                    width: 100%;
                    height: 100%;
                }

                /* Hide the default google icon */
                .goog-te-gadget-icon {
                    display: none !important;
                }
                
                .goog-te-menu-value {
                    margin: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 6px !important;
                }
                
                .goog-te-menu-value span {
                    color: #4b5563 !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                }
                
                /* Triangle dropdown indicator */
                .goog-te-menu-value:after {
                    content: '▼' !important;
                    font-size: 9px !important;
                    color: #9ca3af !important;
                    margin-top: 1px;
                }
                
                .goog-te-gadget-simple:hover .goog-te-menu-value span,
                .goog-te-gadget-simple:hover .goog-te-menu-value:after {
                    color: #111827 !important;
                }

                .goog-logo-link,
                .goog-te-gadget img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
