const fs = require('fs');

function mobileVoiceButton(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert the inline button into a floating mobile button + hidden inline on mobile
    const oldButton = `<button onClick={startVoiceRecording} className="text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1 text-[10px] font-black uppercase">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                     {language === 'ar' ? "تسجيل الحادث صوتياً" : "Voice Input"}
                                  </button>`;
                                  
    const newButton = `<button onClick={startVoiceRecording} className="hidden md:flex text-brand-500 hover:text-brand-600 transition-colors items-center gap-1 text-[10px] font-black uppercase">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                     {language === 'ar' ? "تسجيل الحادث صوتياً" : "Voice Input"}
                                  </button>
                                  
                                  <button onClick={startVoiceRecording} className="md:hidden fixed bottom-4 left-4 right-4 z-50 enterprise-button-primary bg-[#0f6cbd] text-white py-3 rounded-lg shadow-2xl flex items-center justify-center gap-2 text-sm font-bold active:scale-95 transition-transform border border-[#115ea3]">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                                     {language === 'ar' ? "اضغط للتبليغ الصوتي" : "Tap for Voice Input"}
                                  </button>`;

    content = content.replace(oldButton, newButton);
    fs.writeFileSync(filePath, content);
}

mobileVoiceButton('components/IncidentForm.tsx');
console.log("Voice button fixed!");
