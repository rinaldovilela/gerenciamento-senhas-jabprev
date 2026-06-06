import React from 'react';

interface LogoProps {
    className?: string;
    theme?: 'light' | 'dark';
}

export const JaboataoPrevLogo: React.FC<LogoProps> = ({ className = '', theme = 'dark' }) => {
    const isDark = theme === 'dark';
    return (
        <div className={`flex items-center gap-3.5 select-none ${className}`}>
            <div className={`p-2.5 rounded-2xl border transition-all duration-300 ${
                isDark 
                    ? 'bg-white/10 border-white/10 backdrop-blur-md shadow-inner' 
                    : 'bg-slate-100 border-slate-200 shadow-sm'
            }`}>
                <img 
                    src="/logo-jabprev.png" 
                    alt="JaboatãoPrev" 
                    className={`h-9 w-auto object-contain transition-all duration-300 ${
                        isDark ? 'brightness-0 invert' : ''
                    }`} 
                />
            </div>
            <div className="flex flex-col text-left">
                <span className={`font-montserrat font-black text-sm tracking-wider leading-none transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-[#204FA1]'
                }`}>
                    JABOATÃO
                </span>
                <span className={`font-poppins font-bold text-[10px] tracking-widest leading-none mt-1 transition-colors duration-300 ${
                    isDark ? 'text-amber-400' : 'text-slate-500'
                }`}>
                    PREV
                </span>
            </div>
        </div>
    );
};

export default JaboataoPrevLogo;
