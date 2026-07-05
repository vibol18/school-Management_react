import React, { useRef } from "react";
import html2canvas from "html2canvas";

function CertificateTemplate({ data }) {
    
    const certificateRef = useRef(null);

    
    const handleDownloadImage = async () => {
        if (certificateRef.current) {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, 
                useCORS: true 
            });
            const image = canvas.toDataURL("image/png");
            
            
            const link = document.createElement("a");
            link.href = image;
            link.download = `Certificate-${data?.studentName || "Student"}.png`;
            link.click();
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen justify-center">
            
            {}
            <div 
                ref={certificateRef}
                className="relative w-[1122px] h-[630px] bg-white border-[16px] border-[#d4af37] flex overflow-hidden select-none shadow-2xl"
                style={{ boxSizing: 'border-box' }}
            >
                {}
                <div 
                    className="absolute top-0 left-0 h-full w-[300px] bg-[#1d2951]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 65% 100%, 0 100%)" }}
                ></div>
                <div 
                    className="absolute top-0 left-0 h-full w-[280px] bg-[#253467] opacity-40"
                    style={{ clipPath: "polygon(0 0, 100% 0, 45% 100%, 0 100%)" }}
                ></div>

                {}
                <div className="absolute bottom-[240px] left-[55px] z-10 flex flex-col items-center">
                    {}
                    <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#f9d976] via-[#d4af37] to-[#996515] p-1 flex items-center justify-center shadow-lg border border-[#fff3b0]">
                        <div className="w-[130px] h-[130px] rounded-full border-4 border-dashed border-[#fff/40] flex items-center justify-center bg-gradient-to-tr from-[#996515] to-[#f9d976]">
                            {}
                            <svg className="w-16 h-16 text-[#3a2503] fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                        </div>
                    </div>
                    {}
                    <div className="flex justify-between w-28 -mt-5">
                        <div className="w-10 h-14 bg-gradient-to-b from-[#d4af37] to-[#996515]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}></div>
                        <div className="w-10 h-14 bg-gradient-to-b from-[#d4af37] to-[#996515]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}></div>
                    </div>
                </div>

                {}
                <div className="flex-1 pl-[280px] pr-12 pt-16 flex flex-col items-center text-center z-10">
                    
                    {}
                    <div className="w-full max-w-[550px] border-b border-t border-gray-300 py-1 mb-1">
                        <h1 className="text-5xl font-serif tracking-[6px] text-[#2c3e50] font-bold uppercase">
                            Certificate
                        </h1>
                    </div>
                    <p className="text-xs uppercase font-semibold tracking-[4px] text-gray-500 mb-14">
                        Of Achievement
                    </p>

                    {}
                    <h2 className="text-4xl font-serif text-[#1d2951] font-bold italic border-b-2 border-gray-200 px-8 pb-2 min-w-[400px]">
                        {data?.studentName || "Enter Name Here"}
                    </h2>

                    {}
                    <p className="text-gray-600 text-sm max-w-[520px] mt-6 leading-relaxed font-sans">
                        Successfully completed the course <span className="font-bold text-gray-900">"{data?.courseName || "Course Name"}"</span> with a grade performance of <span className="font-bold text-green-700">[{data?.grade || "A+"}]</span>. This certificate validates their outstanding dedication, technical execution, and comprehensive understanding of the curriculum.
                    </p>

                    {}
                    <div className="w-full flex justify-between mt-auto mb-10 px-8">
                        {}
                        <div className="flex flex-col items-center w-48">
                            <span className="text-sm text-gray-800 font-medium border-b border-gray-400 w-full pb-1">
                                {data?.issueDate || "2026-05-26"}
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-gray-400 mt-1 font-bold">
                                Date
                            </span>
                        </div>

                        {}
                        <div className="self-end pb-4">
                            <svg className="w-6 h-6 text-[#d4af37] fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                        </div>

                        {}
                        <div className="flex flex-col items-center w-48">
                            <span className="text-sm font-serif italic text-gray-800 border-b border-gray-400 w-full pb-1 font-bold">
                                Mitch Academy
                            </span>
                            <span className="text-[11px] uppercase tracking-wider text-gray-400 mt-1 font-bold">
                                Signature
                            </span>
                        </div>
                    </div>

                </div>

            </div>
            {}

            {}
            <button
                onClick={handleDownloadImage}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download Certificate Image (PNG)
            </button>

        </div>
    );
}

export default CertificateTemplate;