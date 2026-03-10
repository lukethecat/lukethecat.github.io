'use client';

export function LanguageSwitcher() {
    return (
        <div className="flex items-center">
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
                    min-height: 32px;
                }
                .goog-te-gadget-simple {
                    background-color: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(8px) !important;
                    border: 1px solid rgba(243, 244, 246, 1) !important;
                    padding: 4px 10px !important;
                    border-radius: 8px !important;
                    font-family: inherit !important;
                    display: flex !important;
                    align-items: center !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
                }
                .goog-te-gadget-simple:hover {
                    background-color: white !important;
                    border-color: rgba(209, 213, 219, 1) !important;
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
                .goog-te-menu-value:after {
                    content: '▼' !important;
                    font-size: 10px !important;
                    color: #9ca3af !important;
                }
                /* Hide "Powered by Google" text */
                .goog-logo-link {
                    display: none !important;
                }
                .goog-te-gadget {
                    color: transparent !important;
                }
            `}</style>
        </div>
    );
}

