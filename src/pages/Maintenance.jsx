import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Maintenance = () => {
    const { isArabic } = useLanguage();

    const content = {
        en: {
            title: "Under Maintenance",
            message: "  I'm currently updating my website to provide you with a better experience. I'll be back shortly!",
            backLater: "Please check back later.",
            contact: "Contact me at: hasansaafen1234@gmail.com"
        },
        ar: {
            title: "قيد الصيانة",
            message: "  أنا أقوم حالياً بتحديث موقعي لتزويدك بتجربة أفضل. سأعود قريباً!",
            backLater: "يرجى التحقق مرة أخرى في وقت لاحق.",
            contact: "تواصل معي عبر: hasansaafen1234@gmail.com"
        }
    };

    const currentContent = isArabic ? content.ar : content.en;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white p-4 font-sans">
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {currentContent.title}
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                        {currentContent.message}
                    </p>
                    <p className="text-blue-400 font-medium">
                        {currentContent.backLater}
                    </p>
                </div>

                <div className="pt-8">
                    <div className="inline-block px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                         <p className="text-gray-300 text-sm">
                            {currentContent.contact}
                        </p>
                    </div>
                </div>

                {/* Aesthetic background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>
            </div>
        </div>
    );
};

export default Maintenance;
