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
        <div className="min-h-screen flex items-center justify-center bg-[#161616] text-[#f4f4f4] p-4 font-sans">
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-500">

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#4589ff]">
                        {currentContent.title}
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
                        {currentContent.message}
                    </p>
                    <p className="text-[#4589ff] font-medium">
                        {currentContent.backLater}
                    </p>
                </div>

                <div className="pt-8">
                    <div className="inline-block px-6 py-3 bg-[#262626] border border-[#393939]">
                         <p className="text-gray-300 text-sm">
                            {currentContent.contact}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
