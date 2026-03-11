'use client';

export function LanguageSwitcher() {
    return (
        <div className="relative overflow-hidden group bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:shadow-md transition-all duration-300 flex items-center h-[36px] w-[130px] cursor-pointer">
            
            {/* Exact static button appearance that will never stretch or deform */}
            <div className="absolute inset-0 flex items-center justify-center w-full h-full pointer-events-none space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[13px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                    Language
                </span>
                <span className="text-[9px] text-gray-400 font-sans mt-[1px]">▼</span>
            </div>

            {/* Invisible Google Translate overlay that catches absolutely all clicks */}
            <div className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer">
                <div id="google_translate_element" className="w-full h-full"></div>
            </div>
            
            <style jsx global>{`
                /* Hide Google's annoying top bar and hover tooltips */
                .goog-te-banner-frame.skiptranslate,
                .goog-tooltip,
                .goog-tooltip:hover {
                    display: none !important;
                }
                body {
                    top: 0px !important;
                }
                
                #google_translate_element {
                    width: 100%;
                    height: 100%;
                }

                .goog-te-gadget {
                    height: 100%;
                    width: 100%;
                }

                /* Stretch the hit area over the entire container */
                .goog-te-gadget-simple {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                    width: 100% !important;
                    height: 36px !important;
                    display: block !important;
                    cursor: pointer !important;
                }
                
                /* Extra safeguard to ensure the widget's internal text/icons don't overflow */
                .goog-te-menu-value,
                .goog-te-gadget-icon,
                .goog-logo-link,
                .goog-te-gadget img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
