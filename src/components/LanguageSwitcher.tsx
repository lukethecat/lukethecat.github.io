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

            {/* Google Translate overlay — near-invisible but clickable in all browsers including Safari */}
            <div className="absolute inset-0 z-10 w-full h-full cursor-pointer" style={{opacity: 0.01}}>
                <div id="google_translate_element" className="w-full h-full"></div>
            </div>
            
        </div>
    );
}
