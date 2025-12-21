"use client";
import React, { useState, useEffect } from "react";

export default function TamilPopup({
  onClose,
  duration = 3000,
  position = "top-right",
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const positionClasses =
    position === "relative"
      ? "block animate-fade-in-left w-full" 
      : position === "right-side"
      ? "fixed top-1/2 right-6 transform -translate-y-1/2 z-50 animate-fade-in-left hidden md:block" // Keep this for fallback, but relative is primary now
      : "fixed top-4 right-4 z-50 animate-fade-in-down";

  return (
    <div style={{border:"1px solid black",borderRadius:"10px",boxShadow:"0 4px 6px rgba(235, 128, 128, 0.1)",padding:"20px",width:"300px",height:"390px",}} className={positionClasses}>
      {/* Card Container */}
      <div className="relative group w-full">
        {/* Glow Effect behind card - adjusted for theme compatibility */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        {/* Solid Background Card to match app theme */}
        <div className="relative rounded-2xl shadow-xl overflow-hidden border-2 border-gray-300 bg-white" style={{ background: "var(--card-bg, #ffffff)", color: "var(--card-text)" }}>
          
          {/* subtle mesh background - lighter for better text contrast if not dark mode */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-400/10 filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-400/10 filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-6 relative">
            {/* Close Button */}
            

            {/* Header */}
            <div className="flex flex-col items-end text-right mb-5 mt-2">
               <h4 className="text-2xl font-extrabold leading-none tracking-tight" style={{ color: "var(--card-text)" }}>
                 தமிழ் தட்டச்சு தகவல் 
               </h4>
            </div>

            {/* Content */}
            <div className="space-y-5">
             <p className="text-xs text-gray-600 leading-relaxed">
            எழுத்து ஒலிப்பு ஆங்கிலம் (எடுத்துக்காட்டு.. <b>"vanakam"</b>) என மாற்ற <b>Space</b> அழுத்தவும்.. 
             <br/>
             </p>

              {/* Example Box - Styled like a code block/terminal */}
              <div className="bg-gray-900 rounded-xl p-4 shadow-inner border border-gray-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 text-xs font-mono">உள்ளீடு :</span>
                    <span className="text-green-400 font-mono font-bold tracking-wide">vanakkam +<b>Space</b></span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400 text-xs font-mono">வெளியீடு :</span>
                    <span className="text-white font-bold text-xl">வணக்கம்</span>
                     
             <span style={{paddingTop:"20px"}}className="text-[10px] text-gray-400 mt-1 block"><br></br> <br></br> எண்கள் மற்றும் சிறப்பு எழுத்துக்கள் மாறாமல் இருக்கும்.</span>
          
                    <button style={{marginLeft: "20px",padding: "5px",color: "var(--card-text)",borderRadius:"5px",width: "90%",marginTop:"20px"}}
              onClick={() => {
                setVisible(false);
                if (onClose) onClose();
              }}
              className="absolute top-4 right-4 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-all duration-200 z-10"
              title="Close Card"
            >
              ரத்து செய்
            </button>
                  </div>
                </div>
              </div>

              {/* Minimalist Hint */}
              
            </div>
          </div>
        </div>
        
        {/* Pointer Arrow removed as per checking previous context, keeping it clean */}
      </div>
    </div>
  );
}
