'use client';

export function LanguageSwitcher() {
    return (
        <div className="flex items-center bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-gray-300 transition-all duration-300">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-medium text-gray-600 mr-2">Language</span>
            <div id="google_translate_element" className="premium-translate"></div>
            <style jsx global>{`
                /* Hide Google Translate top bar */
                .goog-te-banner-frame.skiptranslate {
                    display: none !important;
                }
                body {
                    top: 0px !important;
                }
                /* Style the widget container */
                .premium-translate {
                    min-height: 24px;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                }
                .goog-te-gadget-simple {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                    font-family: inherit !important;
                    display: flex !important;
                    align-items: center !important;
                }
                .goog-te-gadget-icon {
                    display: none !important;
                }
                .goog-te-menu-value {
                    margin: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                }
                .goog-te-menu-value span {
                    color: #4b5563 !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                }
                .goog-te-menu-value span:hover {
                    color: #111827 !important;
                }
                /* Hide "Powered by Google" text and extra spacing */
                .goog-logo-link {
                    display: none !important;
                }
                .goog-te-gadget {
                    color: transparent !important;
                    font-size: 0 !important;
                }
                .goog-te-gadget img {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}

