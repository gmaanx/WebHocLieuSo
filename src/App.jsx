import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
    Search, X, ArrowRight, FileText, Instagram, Facebook, Github, 
    UploadCloud, Loader, Trash2, CheckCircle2, FilePenLine, 
    Droplets, Wind, ChevronLeft, ChevronDown, Check, AlertCircle, Menu 
} from 'lucide-react';
import MotherlandFont from './assets/fonts/NVN-Motherland-Signature-1.ttf'; 
const CONFIG = {
  COVERS: ["./img/cover1.jpg", "./img/cover2.jpg", "./img/cover3.jpg", "./img/cover4.jpg"],
  FEEDBACK_BG: "./img/feedback-bg.jpg",
  HERO_BG: "./img/hero-bg.jpg",
  DASHBOARD_IMGS: {
      PAPER: "./img/dashboard1.jpg", 
      WATER: "./img/dashboard2.jpg", 
      CO2: "./img/dashboard3.jpg"   
  }
};

const INITIAL_DOCS = [
  { id: 1, title: "Giải tích 1", desc: "Tổng hợp đề thi cuối kỳ K48, K49 có lời giải chi tiết từng bước.", year: "K50", major: "CNTT", type: "Đề thi", cover: CONFIG.COVERS[0], fileUrl: "#" },
  { id: 2, title: "Marketing Căn Bản", desc: "Slide bài giảng 8 chương, bài tập nhóm và case study thực tế.", year: "K51", major: "Kinh tế", type: "Slide", cover: CONFIG.COVERS[1], fileUrl: "#" },
  { id: 3, title: "Đồ án Tốt Nghiệp", desc: "Báo cáo mẫu hệ thống quản lý thư viện đạt điểm A hội đồng.", year: "K49", major: "Điện tử", type: "Báo cáo", cover: CONFIG.COVERS[2], fileUrl: "#" },
  { id: 4, title: "Toeic Vocabulary", desc: "Ebook 500 từ vựng sát đề thi nhất dành cho sinh viên năm cuối.", year: "K51", major: "NNA", type: "Sách", cover: CONFIG.COVERS[3], fileUrl: "#" },
  { id: 5, title: "Triết học Mác - Lênin", desc: "Tiểu luận mẫu điểm cao chủ đề vật chất và ý thức.", year: "K51", major: "Chung", type: "Tiểu luận", cover: CONFIG.COVERS[0], fileUrl: "#" },
  { id: 6, title: "C++ Programming Basic", desc: "Giáo trình nhập môn lập trình cho người mới bắt đầu.", year: "K50", major: "CNTT", type: "Giáo trình", cover: CONFIG.COVERS[1], fileUrl: "#" },
  { id: 7, title: "Kinh tế vi mô", desc: "Bài tập lớn và đề cương ôn tập.", year: "K51", major: "Kinh tế", type: "Đề cương", cover: CONFIG.COVERS[2], fileUrl: "#" },
  { id: 8, title: "Pháp luật đại cương", desc: "Câu hỏi trắc nghiệm có đáp án.", year: "K50", major: "Luật", type: "Trắc nghiệm", cover: CONFIG.COVERS[3], fileUrl: "#" },
];

const MOCK_EXAM_QUESTIONS = [
    { id: 1, question: "Câu hỏi 1", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctAnswer: 0 },
    { id: 2, question: "Câu hỏi 2", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctAnswer: 0 },
    { id: 3, question: "Câu hỏi 3", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctAnswer: 0 },
    { id: 4, question: "Câu hỏi 4", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctAnswer: 0 },
    { id: 5, question: "Câu hỏi 5", options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correctAnswer: 0 }
];

const Utils = {
  removeTones: (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(),
  
  calcScore: (doc, searchTerm) => {
    const term = Utils.removeTones(searchTerm.trim());
    const title = Utils.removeTones(doc.title);
    const desc = Utils.removeTones(doc.desc);
    const keywords = term.split(/\s+/); 
    let score = 0;
    
    if (title.includes(term)) score += 100;
    if (desc.includes(term)) score += 20;
    
    let matchedTokens = 0;
    keywords.forEach(word => {
        if (title.includes(word)) { score += 10; matchedTokens++; }
        else if (desc.includes(word)) { score += 2; matchedTokens++; }
    });
    
    if (matchedTokens === keywords.length && keywords.length > 1) score += 15;
    return score;
  },

  getRandomCover: () => CONFIG.COVERS[Math.floor(Math.random() * CONFIG.COVERS.length)]
};

// Hook check mobile device
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    return isMobile;
};

const Styles = {
    colors: { 
        primary: '#1d1d1f', 
        white: '#ffffff', 
        orange: '#f97316', 
        loading: '#007E6E', 
        green: '#34C759', 
        red: '#EF4444', 
        gray: '#e0e0e0', 
        lightGray: '#f5f5f7' 
    },
    global: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); 
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap');

        @font-face {
            font-family: 'NVN-Motherland-Signature-1';
            src: url('${MotherlandFont}') format('truetype'); 
            font-weight: normal;
            font-style: normal;
        }
        :root, body, #root { width: 100%; margin: 0; padding: 0; background-color: #ffffff; font-family: "Montserrat", sans-serif; overflow-x: hidden; scroll-behavior: auto !important; }
        html.lenis { height: auto; } 
        .lenis.lenis-smooth { scroll-behavior: auto; } 
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; } 
        .lenis.lenis-stopped { overflow: hidden; } 
        .lenis.lenis-scrolling iframe { pointer-events: none; } 
        
        .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; padding: 40px; }
        
        .dashboard-container { display: flex; gap: 20px; height: 400px; }
        .dashboard-card { flex: 1; min-width: 100px; }

        @media (max-width: 768px) { 
            .menu-grid { grid-template-columns: 1fr; padding: 20px; } 
            .desktop-nav { display: none !important; }
            .mobile-menu-container { display: flex !important; }
            
            .dashboard-container { flex-direction: column; height: auto !important; }
            .dashboard-card { width: 100% !important; height: 280px !important; flex: none !important; }
            .doc-viewer-header-right { gap: 8px !important; flex-shrink: 0; }
            .doc-title-container { flex: 1; width: 0; min-width: 0; }
        }
        @media (min-width: 769px) {
            .mobile-menu-container { display: none !important; }
            .desktop-nav { display: flex !important; }
        }

        .upload-modal-box {
            background-color: #fff; padding: 30px; border-radius: 24px; width: 90%; max-width: 450px;
            max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.1); transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            .upload-modal-box { width: 85%; height: auto; max-height: 80vh; border-radius: 40px; padding: 24px; display: flex; flex-direction: column; }
            .upload-modal-box > div { width: 100%; }
        }

        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #bbb; border-radius: 10px; }
        .suggestion-item:hover { background-color: #f5f5f7; cursor: pointer; }

        @keyframes square-animation {
            0% { left: 0; top: 0; } 10.5% { left: 0; top: 0; } 12.5% { left: 32px; top: 0; } 23% { left: 32px; top: 0; } 25% { left: 64px; top: 0; } 35.5% { left: 64px; top: 0; } 37.5% { left: 64px; top: 32px; } 48% { left: 64px; top: 32px; } 50% { left: 32px; top: 32px; } 60.5% { left: 32px; top: 32px; } 62.5% { left: 32px; top: 64px; } 73% { left: 32px; top: 64px; } 75% { left: 0; top: 64px; } 85.5% { left: 0; top: 64px; } 87.5% { left: 0; top: 32px; } 98% { left: 0; top: 32px; } 100% { left: 0; top: 0; }
        }

        .loader { position: relative; width: 96px; height: 96px; transform: rotate(45deg); margin: 0 auto 20px auto; }
        .loader-square { position: absolute; top: 0; left: 0; width: 28px; height: 28px; margin: 2px; border-radius: 0px; background: white; background-size: cover; background-position: center; background-attachment: fixed; animation: square-animation 10s ease-in-out infinite both; }
        .loader-square:nth-of-type(0) { animation-delay: 0s; }
        .loader-square:nth-of-type(1) { animation-delay: -1.4285714286s; }
        .loader-square:nth-of-type(2) { animation-delay: -2.8571428571s; }
        .loader-square:nth-of-type(3) { animation-delay: -4.2857142857s; }
        .loader-square:nth-of-type(4) { animation-delay: -5.7142857143s; }
        .loader-square:nth-of-type(5) { animation-delay: -7.1428571429s; }
        .loader-square:nth-of-type(6) { animation-delay: -8.5714285714s; }
        .loader-square:nth-of-type(7) { animation-delay: -10s; }
        
        .liquid-3-container { display: flex; align-items: center; justify-content: center; }
        .liquid-3 { --time: 0.6s; appearance: none; position: relative; cursor: pointer; width: 50px; height: 25px; background: var(--primary); border-radius: 50px; box-shadow: 0 0 0 2px var(--secondary); transform: translateX(0); transition: transform var(--time) cubic-bezier(0.75, 0, 0.75, 50); filter: blur(1px) contrast(20); overflow: hidden; outline: none; -webkit-tap-highlight-color: transparent; }
        .liquid-3::before { content: ""; position: absolute; width: 200%; height: 100%; transform: translate(-25%, -50%); left: 50%; top: 50%; background: radial-gradient(closest-side circle at 12.5% 50%, var(--secondary) 50%, transparent 0), radial-gradient(closest-side circle at 87.5% 50%, var(--secondary) 50%, transparent 0); transition: transform var(--time) cubic-bezier(0.75, 0, 0.75, 1.3); }
        .liquid-3:checked::before { transform: translate(-75%, -50%); }

        .slider-style { --slider-width: 100%; --slider-height: 6px; --slider-bg: #e5e7eb; --slider-border-radius: 999px; --level-color: #f97316; --level-transition-duration: .1s; cursor: pointer; display: inline-flex; align-items: center; width: 100%; }
        .slider-style .level { -webkit-appearance: none; -moz-appearance: none; appearance: none; width: var(--slider-width); height: var(--slider-height); background: var(--slider-bg); overflow: hidden; border-radius: var(--slider-border-radius); transition: height var(--level-transition-duration); cursor: pointer; outline: none; }
        .slider-style .level::-webkit-slider-thumb { -webkit-appearance: none; width: 0; height: 0; -webkit-box-shadow: -1000px 0 0 1000px var(--level-color); box-shadow: -1000px 0 0 1000px var(--level-color); }
        .slider-style:hover .level { height: 14px; }
        .slider-wrapper .value-tooltip { opacity: 0; transition: opacity 0.2s; }
        .slider-wrapper:hover .value-tooltip { opacity: 1; }
        .slider-wrapper:active .value-tooltip { opacity: 1; }
    `,
    searchStyleFixed: { width: '100%', padding: '18px 140px 18px 50px', borderRadius: '50px', backgroundColor: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box', border: '1px solid #e0e0e0', color: '#1d1d1f' },
    suggestionBox: { position: 'absolute', top: '100%', left: '20px', right: '20px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', marginTop: '10px', border: '1px solid #f0f0f0' },
    suggestionItem: { padding: '12px 20px', borderBottom: '1px solid #f5f5f7', display: 'flex', alignItems: 'center', gap: '10px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#f5f5f7', border: 'none', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', fontWeight: '500' },
    glassTag: { fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', color: '#fff', backdropFilter: 'blur(5px)' }
};

const ScrollFloat = ({ children, style, className, as = "div", delay = 0, ...props }) => {
    const Component = motion[as] || motion.div;
    return (
        <Component 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, delay: delay, ease: "easeOut" }}
            style={style}
            className={className}
            {...props}
        >
            {children}
        </Component>
    );
};

const NavButton = ({ children, onClick, isActive, isDarkBg }) => {
  const activeBg = isDarkBg ? Styles.colors.white : Styles.colors.primary;
  const activeColor = isDarkBg ? Styles.colors.primary : Styles.colors.white;
  const initialBorder = isDarkBg ? `1px solid ${Styles.colors.white}` : `1px solid rgba(0,0,0,0.1)`;
  return (
    <motion.button 
        onClick={onClick} 
        animate={{ 
            backgroundColor: isActive ? activeBg : "transparent", 
            color: isActive ? activeColor : (isDarkBg ? Styles.colors.white : Styles.colors.primary), 
            border: isActive ? "1px solid transparent" : initialBorder 
        }} 
        whileHover={{ backgroundColor: activeBg, color: activeColor, border: "1px solid transparent", scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        transition={{ duration: 0.2 }} 
        style={{ padding: '8px 20px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', margin: '0 4px' }}
    >
        {children}
    </motion.button>
  );
};

const InteractiveButton = ({ 
    children, 
    onClick, 
    style, 
    className, 
    disabled, 
    icon, 
    primary = true, 
    isDarkBg = false, 
    customBlackWhite = false, 
    isNav = false, 
    isUpload = false 
}) => {
    let bgInitial, textInitial, borderInitial, bgHover, textHover, borderHover;

    if (isUpload) {
        bgInitial = "transparent";
        textInitial = Styles.colors.orange;
        borderInitial = isDarkBg ? "#ffffff" : "#1d1d1f";
        bgHover = Styles.colors.orange;
        textHover = "#ffffff";
    } else if (isNav && isDarkBg) { 
        bgInitial = "transparent"; 
        textInitial = "#ffffff"; 
        borderInitial = "#ffffff"; 
        bgHover = "#ffffff"; 
        textHover = "#1d1d1f"; 
    } else if (customBlackWhite) { 
        bgInitial = "#1d1d1f"; 
        textInitial = "#ffffff"; 
        borderInitial = "#1d1d1f"; 
        bgHover = "#ffffff"; 
        textHover = "#1d1d1f"; 
        borderHover = "#1d1d1f"; // Explicitly set black border on hover
    } else { 
        bgInitial = primary ? (isDarkBg ? "#ffffff" : "#1d1d1f") : "transparent"; 
        textInitial = primary ? (isDarkBg ? "#1d1d1f" : "#ffffff") : (isDarkBg ? "#ffffff" : "#1d1d1f"); 
        borderInitial = primary ? "transparent" : (isDarkBg ? "#ffffff" : "#1d1d1f"); 
        
        bgHover = primary ? (isDarkBg ? "#e0e0e0" : "#333") : (isDarkBg ? "#ffffff" : "#1d1d1f"); 
        textHover = primary ? (isDarkBg ? "#1d1d1f" : "#ffffff") : (isDarkBg ? "#1d1d1f" : "#ffffff"); 
    }

    return (
        <motion.button 
            type="button"
            onClick={onClick} 
            disabled={disabled} 
            initial={false} 
            animate={{ 
                backgroundColor: bgInitial, 
                color: textInitial, 
                border: `1px solid ${borderInitial}`, 
                opacity: disabled ? 0.7 : 1 
            }} 
            whileHover={!disabled ? { 
                backgroundColor: bgHover, 
                color: textHover, 
                borderColor: borderHover || (primary ? "transparent" : borderInitial), 
                scale: 1.05 
            } : {}} 
            whileTap={!disabled ? { scale: 0.95 } : {}} 
            transition={{ duration: 0.2 }} 
            style={{ 
                padding: '12px 28px', 
                borderRadius: '50px', 
                fontWeight: '700', 
                fontSize: '14px', 
                cursor: disabled ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                ...style 
            }} 
            className={className}
        >
            {children} {icon && icon}
        </motion.button>
    );
};

const downloadButtonCss = `
  .download-btn { width: 40px; height: 40px; border: none; border-radius: 50%; background-color: rgb(27, 27, 27); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; transition-duration: .3s; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.11); padding: 0; text-decoration: none; overflow: hidden; }
  .download-btn .svgIcon { fill: white; width: 16px; height: 16px; transition: transform 0.3s ease; }
  .download-btn:hover { background-color: black; transform: scale(1.05); }
  .download-btn:active { transform: scale(0.95); }
  .download-btn:hover .svgIcon { fill: white; animation: slide-in-top 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
  @keyframes slide-in-top { 0% { transform: translateY(-10px); opacity: 0; } 100% { transform: translateY(0px); opacity: 1; } }
`;

const DownloadButton = ({ href, downloadName }) => {
    return (
        <>
            <style>{downloadButtonCss}</style>
            <a href={href} download={downloadName} className="download-btn" title="Tải xuống">
                <svg className="svgIcon" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
                </svg>
            </a>
        </>
    )
}

const MenuCard = ({ item, onClick, activeMobileId, setActiveMobileId }) => {
  const isMobile = useIsMobile();
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);

  const isMobileActive = activeMobileId === item.id;
  const isHovered = isMobile ? isMobileActive : isDesktopHovered;

  const handleClick = () => {
    if (isMobile) {
      if (isMobileActive) { onClick(); } else { setActiveMobileId(item.id); }
    } else { onClick(); }
  };

  return (
    <motion.div 
        initial="rest" 
        animate={isHovered ? "hover" : "rest"}
        onMouseEnter={() => !isMobile && setIsDesktopHovered(true)} 
        onMouseLeave={() => !isMobile && setIsDesktopHovered(false)}
        onClick={handleClick} 
        style={{ position: 'relative', height: '450px', borderRadius: '30px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', willChange: 'transform' }}
    >
      <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }} transition={{ duration: 0.8, ease: "easeInOut" }} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${item.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)', zIndex: 1 }} />
      
      <motion.div 
          variants={{ 
              rest: { backgroundColor: "rgba(255,255,255,0)", color: "#ffffff", scale: 1, borderColor: "#ffffff" }, 
              hover: { backgroundColor: "#ffffff", color: "#000000", scale: 1.1, borderColor: "#ffffff" } 
          }} 
          transition={{ duration: 0.3 }} 
          style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 3, width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      > 
          <ArrowRight size={24} /> 
      </motion.div>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', zIndex: 3 }}>
          <motion.div variants={{ rest: { backgroundColor: "rgba(255,255,255,0)", backdropFilter: "blur(0px)" }, hover: { backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(16px)" } }} transition={{ duration: 0.5 }} style={{ borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0)', overflow: 'hidden' }}>
              <motion.h3 layout style={{ color: 'white', fontSize: '32px', margin: 0, fontWeight: '800', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{item.title}</motion.h3>
              <motion.div variants={{ rest: { height: 0, opacity: 0, marginTop: 0 }, hover: { height: "auto", opacity: 1, marginTop: 16 } }} transition={{ duration: 0.4, ease: "easeOut" }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}> <span style={Styles.glassTag}>{item.year}</span><span style={Styles.glassTag}>{item.major}</span> </div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: 1.4, margin: 0 }}>{item.desc}</p>
              </motion.div>
          </motion.div>
      </div>
    </motion.div>
  );
};

const ScrollRevealText = ({ text }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start 0.9", "end 0.6"] });
  return (
    <p ref={container} style={{ fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: 1.4, fontWeight: '700', color: '#1d1d1f', flexWrap: 'wrap', display: 'flex', justifyContent: 'center', gap: '8px 12px', margin: '0 auto', maxWidth: '1200px', padding: '0 40px' }}>
      {text.split(" ").map((word, i) => {
        const start = i / text.split(" ").length;
        const end = start + (1 / text.split(" ").length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
        return <motion.span key={i} style={{ opacity }}>{word}</motion.span>
      })}
    </p>
  );
};

const IntroLoader = ({ onComplete }) => {
    const [isFinished, setIsFinished] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => { setIsFinished(true); setTimeout(onComplete, 800); }, 2000); 
        return () => clearTimeout(timer);
    }, [onComplete]);
    return (
        <motion.div initial={{ opacity: 1 }} animate={isFinished ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.6 }} style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader">
                {[...Array(7)].map((_, i) => <div key={i} className="loader-square" />)}
            </div>
        </motion.div>
    );
};

const banterLoaderCss = `
.banter-loader { position: absolute; left: 50%; top: 50%; width: 72px; height: 72px; margin-left: -36px; margin-top: -36px; }
.banter-loader__box { float: left; position: relative; width: 20px; height: 20px; margin-right: 6px; }
.banter-loader__box:before { content: ""; position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: ${Styles.colors.loading}; border-radius: 4px; }
.banter-loader__box:nth-child(3n) { margin-right: 0; margin-bottom: 6px; }
.banter-loader__box:nth-child(1):before, .banter-loader__box:nth-child(4):before { margin-left: 26px; }
.banter-loader__box:nth-child(3):before { margin-top: 52px; }
.banter-loader__box:last-child { margin-bottom: 0; }
@keyframes moveBox-1 { 9.09% { transform: translate(-26px, 0); } 18.18% { transform: translate(0px, 0); } 27.27% { transform: translate(0px, 0); } 36.36% { transform: translate(26px, 0); } 45.45% { transform: translate(26px, 26px); } 54.54% { transform: translate(26px, 26px); } 63.63% { transform: translate(26px, 26px); } 72.72% { transform: translate(26px, 0px); } 81.81% { transform: translate(0px, 0px); } 90.9% { transform: translate(-26px, 0px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(1) { animation: moveBox-1 4s infinite; }
@keyframes moveBox-2 { 9.09% { transform: translate(0, 0); } 18.18% { transform: translate(26px, 0); } 27.27% { transform: translate(0px, 0); } 36.36% { transform: translate(26px, 0); } 45.45% { transform: translate(26px, 26px); } 54.54% { transform: translate(26px, 26px); } 63.63% { transform: translate(26px, 26px); } 72.72% { transform: translate(26px, 26px); } 81.81% { transform: translate(0px, 26px); } 90.9% { transform: translate(0px, 26px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(2) { animation: moveBox-2 4s infinite; }
@keyframes moveBox-3 { 9.09% { transform: translate(-26px, 0); } 18.18% { transform: translate(-26px, 0); } 27.27% { transform: translate(0px, 0); } 36.36% { transform: translate(-26px, 0); } 45.45% { transform: translate(-26px, 0); } 54.54% { transform: translate(-26px, 0); } 63.63% { transform: translate(-26px, 0); } 72.72% { transform: translate(-26px, 0); } 81.81% { transform: translate(-26px, -26px); } 90.9% { transform: translate(0px, -26px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(3) { animation: moveBox-3 4s infinite; }
@keyframes moveBox-4 { 9.09% { transform: translate(-26px, 0); } 18.18% { transform: translate(-26px, 0); } 27.27% { transform: translate(-26px, -26px); } 36.36% { transform: translate(0px, -26px); } 45.45% { transform: translate(0px, 0px); } 54.54% { transform: translate(0px, -26px); } 63.63% { transform: translate(0px, -26px); } 72.72% { transform: translate(0px, -26px); } 81.81% { transform: translate(-26px, -26px); } 90.9% { transform: translate(-26px, 0px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(4) { animation: moveBox-4 4s infinite; }
@keyframes moveBox-5 { 9.09% { transform: translate(0, 0); } 18.18% { transform: translate(0, 0); } 27.27% { transform: translate(0, 0); } 36.36% { transform: translate(26px, 0); } 45.45% { transform: translate(26px, 0); } 54.54% { transform: translate(26px, 0); } 63.63% { transform: translate(26px, 0); } 72.72% { transform: translate(26px, 0); } 81.81% { transform: translate(26px, -26px); } 90.9% { transform: translate(0px, -26px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(5) { animation: moveBox-5 4s infinite; }
@keyframes moveBox-6 { 9.09% { transform: translate(0, 0); } 18.18% { transform: translate(-26px, 0); } 27.27% { transform: translate(-26px, 0); } 36.36% { transform: translate(0px, 0); } 45.45% { transform: translate(0px, 0); } 54.54% { transform: translate(0px, 0); } 63.63% { transform: translate(0px, 0); } 72.72% { transform: translate(0px, 26px); } 81.81% { transform: translate(-26px, 26px); } 90.9% { transform: translate(-26px, 0px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(6) { animation: moveBox-6 4s infinite; }
@keyframes moveBox-7 { 9.09% { transform: translate(26px, 0); } 18.18% { transform: translate(26px, 0); } 27.27% { transform: translate(26px, 0); } 36.36% { transform: translate(0px, 0); } 45.45% { transform: translate(0px, -26px); } 54.54% { transform: translate(26px, -26px); } 63.63% { transform: translate(0px, -26px); } 72.72% { transform: translate(0px, -26px); } 81.81% { transform: translate(0px, 0px); } 90.9% { transform: translate(26px, 0px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(7) { animation: moveBox-7 4s infinite; }
@keyframes moveBox-8 { 9.09% { transform: translate(0, 0); } 18.18% { transform: translate(-26px, 0); } 27.27% { transform: translate(-26px, -26px); } 36.36% { transform: translate(0px, -26px); } 45.45% { transform: translate(0px, -26px); } 54.54% { transform: translate(0px, -26px); } 63.63% { transform: translate(0px, -26px); } 72.72% { transform: translate(0px, -26px); } 81.81% { transform: translate(26px, -26px); } 90.9% { transform: translate(26px, 0px); } 100% { transform: translate(0px, 0px); } }
.banter-loader__box:nth-child(8) { animation: moveBox-8 4s infinite; }
@keyframes moveBox-9 { 9.09% { transform: translate(-26px, 0); } 18.18% { transform: translate(-26px, 0); } 27.27% { transform: translate(0px, 0); } 36.36% { transform: translate(-26px, 0); } 45.45% { transform: translate(0px, 0); } 54.54% { transform: translate(0px, 0); } 63.63% { transform: translate(-26px, 0); } 72.72% { transform: translate(-26px, 0); } 81.81% { transform: translate(-52px, 0); } 90.9% { transform: translate(-26px, 0); } 100% { transform: translate(0px, 0); } }
.banter-loader__box:nth-child(9) { animation: moveBox-9 4s infinite; }
`;

const BanterLoader = () => (
    <>
        <style>{banterLoaderCss}</style>
        <div style={{ position: 'relative', height: '100px', width: '100%' }}>
            <div className="banter-loader">
                {[...Array(9)].map((_, i) => <div key={i} className="banter-loader__box" />)}
            </div>
        </div>
    </>
);

const PointsWidget = ({ points }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} style={{ position: 'absolute', bottom: '40px', left: '40px', zIndex: 20, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', maxWidth: '280px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
         <div style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1.1, color: 'white' }}>{points} Điểm</div>
         <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.4, opacity: 0.8 }}>Được sử dụng để quy đổi thành các phần thưởng hoặc lợi ích đặc biệt.</p>
      </div>
    </motion.div>
  )
}

const PomodoroHeaderWidget = () => {
    const WORK_TIME = 1500; const BREAK_TIME = 150; 
    const [timeLeft, setTimeLeft] = useState(WORK_TIME); 
    const [isActive, setIsActive] = useState(false); 
    const [mode, setMode] = useState('work'); 
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) { interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000); } 
        else if (timeLeft === 0) { const nextMode = mode === 'work' ? 'break' : 'work'; setMode(nextMode); setTimeLeft(nextMode === 'work' ? WORK_TIME : BREAK_TIME); setIsActive(false); }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);
    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setMode('work'); setTimeLeft(WORK_TIME); };
    const formatTime = (seconds) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; };
    const themeColor = mode === 'work' ? Styles.colors.orange : Styles.colors.green;
    return (
        <div className="pomodoro-widget" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 10px', backgroundColor: '#f5f5f7', borderRadius: '30px', border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: themeColor, minWidth: '45px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#ffffff', color: themeColor }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    style={{
                        backgroundColor: themeColor, border: `1px solid ${themeColor}`, borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}
                >
                    {isActive ? "PAUSE" : "START"}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#666666', color: '#ffffff', borderColor: '#666666' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    style={{
                        backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase'
                    }}
                >
                    RESET
                </motion.button>
            </div>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '4px' }}>{mode === 'work' ? 'FOCUS' : 'BREAK'}</span>
        </div>
    );
};

const ThemeSwitchFixed = ({ isNightMode, toggle }) => {
    const primaryColor = isNightMode ? '#ffffff' : '#000000';
    const secondaryColor = isNightMode ? '#000000' : '#ffffff';
    return (
        <div className="liquid-3-container">
            <input 
                type="checkbox" role="switch" className="liquid-3" checked={isNightMode} onChange={toggle} 
                style={{ '--primary': primaryColor, '--secondary': secondaryColor }}
            />
        </div>
    )
}

const DocViewer = ({ doc, onClose }) => {
    const [isNightMode, setIsNightMode] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);
    const isMobile = useIsMobile(); // Sử dụng hook đã khai báo

    useEffect(() => {
        if (!doc) return;
        if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
            try {
                const arr = doc.fileUrl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                const blob = new Blob([u8arr], { type: mime });
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                return () => { URL.revokeObjectURL(url); };
            } catch (error) { setBlobUrl(doc.fileUrl); }
        } else { setBlobUrl(doc.fileUrl); }
    }, [doc]);

    if (!doc) return null;
    
    const contentFilter = isNightMode ? 'invert(1) hue-rotate(180deg)' : 'none';
    const bgColor = isNightMode ? '#1a1a1a' : 'white';
    const headerBg = isNightMode ? '#222' : '#fff';
    const textColor = isNightMode ? '#eee' : '#1d1d1f';
    const subTextColor = isNightMode ? '#aaa' : '#666';
    const borderColor = isNightMode ? '#333' : '#eee';

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '90vh', backgroundColor: bgColor, borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transition: 'background-color 0.3s ease' }}>
                {/* Header Container */}
                <div style={{ padding: isMobile ? '12px 16px' : '12px 24px', borderBottom: `1px solid ${borderColor}`, backgroundColor: headerBg, transition: 'background-color 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Left: Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: isNightMode ? '#333' : '#f5f5f7', flexShrink: 0, transition: 'background-color 0.3s ease' }}><FileText size={20} color={textColor}/></div>
                            <div className="doc-title-container" style={{ minWidth: 0, flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.3s ease' }}>{doc.title}</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: subTextColor, transition: 'color 0.3s ease' }}>{doc.year} • {doc.major}</p>
                            </div>
                        </div>
                        
                        {/* Right: Controls (Desktop: All inline, Mobile: Hide Pomodoro here) */}
                        <div className="doc-viewer-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <DownloadButton href={blobUrl || doc.fileUrl} downloadName={`${doc.title}.pdf`} />
                            
                            {!isMobile && <PomodoroHeaderWidget />}
                            
                            <ThemeSwitchFixed isNightMode={isNightMode} toggle={() => setIsNightMode(!isNightMode)} />
                            <InteractiveButton onClick={onClose} primary={false} customBlackWhite={!isNightMode} isDarkBg={isNightMode} style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}><X size={20} /></InteractiveButton>
                        </div>
                    </div>

                    {/* Mobile Only: Pomodoro Row */}
                    {isMobile && (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <PomodoroHeaderWidget />
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, backgroundColor: isNightMode ? '#121212' : '#f9fafb', position: 'relative', filter: contentFilter, transition: 'all 0.3s ease' }}>
                    {blobUrl && blobUrl !== "#" ? (
                        <iframe src={blobUrl} width="100%" height="100%" style={{ border: 'none' }} title="Document Viewer" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', gap: '16px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={32} color="#ccc" /></div>
                            <p style={{ fontSize: '15px' }}>Đây là dữ liệu mẫu, chưa có file đính kèm.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Toast = ({ message }) => (
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{ position: 'fixed', bottom: '40px', left: '50%', x: '-50%', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', padding: '12px 24px', borderRadius: '100px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 9999, border: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
        <div style={{ width: '22px', height: '22px', backgroundColor: '#34C759', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="white" strokeWidth={3} /></div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>{message}</span>
    </motion.div>
);

const ExamModal = ({ isOpen, onClose }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [direction, setDirection] = useState(0); 
    const [mode, setMode] = useState('setup'); 
    const [selectedCohort, setSelectedCohort] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const subjects = ["Giải tích 1", "Triết học", "Vật lý đại cương", "Tin học đại cương", "Pháp luật", "Kinh tế vi mô", "Tiếng Anh", "Xác suất thống kê"];

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setCurrentQuestionIndex(0); setAnswers({});
            setDirection(0); setMode('setup'); setSelectedCohort(''); setSelectedSubject('');
        }
    }, [isOpen]);

    const handleSelectAnswer = (optionIndex) => { if (mode === 'review') return; setAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex })); };
    const handleNext = () => { if (currentQuestionIndex < MOCK_EXAM_QUESTIONS.length - 1) { setDirection(1); setCurrentQuestionIndex(prev => prev + 1); } else { setMode('score'); } };
    const handlePrev = () => { if (currentQuestionIndex > 0) { setDirection(-1); setCurrentQuestionIndex(prev => prev - 1); } };
    const calculateScore = () => { let correctCount = 0; MOCK_EXAM_QUESTIONS.forEach((q, index) => { if (answers[index] === q.correctAnswer) correctCount++; }); return correctCount; };
    const handleStartExam = () => { setMode('generating'); setTimeout(() => { setMode('quiz'); }, 2000); };

    if (!isOpen) return null;
    const currentQ = MOCK_EXAM_QUESTIONS[currentQuestionIndex];
    const currentSelectedAnswer = answers[currentQuestionIndex];
    const score = calculateScore();
    const slideVariants = { enter: (direction) => ({ x: direction > 0 ? 400 : -400, opacity: 0, scale: 0.9, filter: 'blur(10px)' }), center: { zIndex: 1, x: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }, exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 400 : -400, opacity: 0, scale: 0.9, filter: 'blur(10px)' }) };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '1200px', height: '85vh', backgroundColor: '#f8fafc', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: '4px' }}>{(mode === 'quiz' || mode === 'review') && MOCK_EXAM_QUESTIONS.map((_, idx) => (<div key={idx} style={{ width: '30px', height: '4px', borderRadius: '2px', backgroundColor: idx <= currentQuestionIndex ? (mode === 'review' ? '#64748b' : Styles.colors.loading) : '#e2e8f0', transition: 'all 0.3s' }} />))}</div>
                    <InteractiveButton onClick={onClose} customBlackWhite={true} primary={false} style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}><X size={20} /></InteractiveButton>
                </div>
                <div data-lenis-prevent style={{ flex: 1, position: 'relative', overflowY: (mode === 'setup' || mode === 'score') ? 'auto' : 'hidden', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: (mode === 'setup' || mode === 'score') ? 'flex-start' : 'center', paddingBottom: '20px', overscrollBehavior: 'contain' }}>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {mode === 'setup' && (
                             <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: '80%', maxWidth: '600px', textAlign: 'center', margin: '40px auto' }}>
                                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1d1d1f', marginBottom: '30px' }}>Thiết lập đề thi</h2>
                                <div style={{ marginBottom: '30px', textAlign: 'left' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '10px' }}>Chọn khóa</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>{['K49', 'K50', 'K51'].map(k => (<button key={k} onClick={() => setSelectedCohort(k)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: selectedCohort === k ? `2px solid ${Styles.colors.loading}` : '1px solid #e2e8f0', backgroundColor: selectedCohort === k ? '#f0fdfa' : 'white', color: selectedCohort === k ? Styles.colors.loading : '#1d1d1f', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>{k}</button>))}</div>
                                </div>
                                <div style={{ marginBottom: '40px', textAlign: 'left' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '10px' }}>Chọn môn học</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>{subjects.map(sub => (<button key={sub} onClick={() => setSelectedSubject(sub)} style={{ padding: '12px', borderRadius: '12px', border: selectedSubject === sub ? `2px solid ${Styles.colors.loading}` : '1px solid #e2e8f0', backgroundColor: selectedSubject === sub ? '#f0fdfa' : 'white', color: selectedSubject === sub ? Styles.colors.loading : '#1d1d1f', fontWeight: '500', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>{sub}</button>))}</div>
                                </div>
                                <motion.div animate={{ opacity: (!selectedCohort || !selectedSubject) ? 0.5 : 1, y: (!selectedCohort || !selectedSubject) ? 10 : 0 }}><InteractiveButton onClick={handleStartExam} disabled={!selectedCohort || !selectedSubject} primary={true} style={{ width: '100%', justifyContent: 'center', backgroundColor: (!selectedCohort || !selectedSubject) ? '#cbd5e1' : Styles.colors.loading, border: 'none' }}>Tạo đề ngay</InteractiveButton></motion.div>
                            </motion.div>
                        )}
                        {mode === 'generating' && (
                            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
                                <BanterLoader />
                                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginTop: '20px' }}>Đang tạo đề thi...</h3>
                                <p style={{ color: '#64748b' }}>Đang tổng hợp câu hỏi từ ngân hàng dữ liệu...</p>
                            </motion.div>
                        )}
                        {(mode === 'quiz' || mode === 'review') && (
                            <motion.div layout key={currentQ.id} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} style={{ width: '80%', backgroundColor: '#fff', borderRadius: '32px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '100%', overflowY: 'auto', overscrollBehavior: 'contain', margin: 'auto' }}>
                                <motion.div layout="position" style={{ fontSize: '13px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{mode === 'review' ? 'Xem lại: ' : ''}Câu hỏi {currentQuestionIndex + 1} / {MOCK_EXAM_QUESTIONS.length}</motion.div>
                                <motion.h2 layout="position" style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', margin: 0, lineHeight: 1.3 }}>{currentQ.question}</motion.h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', paddingBottom: '10px' }}>
                                    {currentQ.options.map((opt, idx) => {
                                        let isSelected = currentSelectedAnswer === idx; let borderColor = 'transparent'; let bgColor = '#f8fafc'; let textColor = '#475569'; let Icon = null;
                                        if (mode === 'quiz') { if (isSelected) { borderColor = Styles.colors.loading; bgColor = '#f0fdfa'; textColor = Styles.colors.loading; Icon = <CheckCircle2 size={20} color={Styles.colors.loading} />; } } 
                                        else if (mode === 'review') { if (idx === currentQ.correctAnswer) { borderColor = Styles.colors.green; bgColor = '#f0fdf4'; textColor = Styles.colors.green; Icon = <Check size={20} color={Styles.colors.green} />; } else if (isSelected && idx !== currentQ.correctAnswer) { borderColor = Styles.colors.red; bgColor = '#fef2f2'; textColor = Styles.colors.red; Icon = <X size={20} color={Styles.colors.red} />; } else if (isSelected) { borderColor = Styles.colors.green; bgColor = '#f0fdf4'; textColor = Styles.colors.green; Icon = <Check size={20} color={Styles.colors.green} />; } }
                                        return (<motion.div layout key={idx} onClick={() => handleSelectAnswer(idx)} whileHover={mode === 'quiz' ? { scale: 1.02 } : {}} whileTap={mode === 'quiz' ? { scale: 0.98 } : {}} style={{ padding: '16px 24px', borderRadius: '16px', backgroundColor: bgColor, border: `2px solid ${borderColor}`, color: textColor, fontSize: '15px', fontWeight: '600', cursor: mode === 'quiz' ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>{opt}{Icon}</motion.div>);
                                    })}
                                </div>
                            </motion.div>
                        )}
                        {mode === 'score' && (<motion.div layout key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', margin: 'auto' }}><div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}><Check size={50} strokeWidth={4} /></div><h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1d1d1f', marginBottom: '12px' }}>Hoàn thành!</h2><p style={{ color: '#64748b', fontSize: '18px', marginBottom: '8px' }}>Số câu đúng: <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{score}/{MOCK_EXAM_QUESTIONS.length}</span></p><p style={{ color: '#64748b', fontSize: '18px', marginBottom: '30px' }}>Điểm số: <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{(score / MOCK_EXAM_QUESTIONS.length) * 10}</span></p><div style={{ display: 'flex', gap: '10px' }}><InteractiveButton onClick={() => { setMode('review'); setCurrentQuestionIndex(0); setDirection(0); }} primary={false} style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#1d1d1f' }}>Xem lại</InteractiveButton><InteractiveButton onClick={onClose} primary={true} style={{ width: '100%', justifyContent: 'center', backgroundColor: '#16a34a' }}>Đóng</InteractiveButton></div></motion.div>)}
                    </AnimatePresence>
                </div>
                <div style={{ padding: '20px 30px', backgroundColor: 'transparent', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(mode === 'quiz' || mode === 'review') && (<div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>{currentQuestionIndex > 0 && (<motion.button onClick={handlePrev} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '16px 24px', borderRadius: '100px', border: 'none', backgroundColor: '#f1f5f9', color: '#1d1d1f', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}><ChevronLeft size={20} /> Quay lại</motion.button>)}<motion.button onClick={handleNext} disabled={mode === 'quiz' && currentSelectedAnswer === undefined} animate={{ scale: (mode === 'review' || currentSelectedAnswer !== undefined) ? 1 : 0.9, opacity: (mode === 'review' || currentSelectedAnswer !== undefined) ? 1 : 0.5, y: (mode === 'review' || currentSelectedAnswer !== undefined) ? 0 : 10 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: '16px 40px', borderRadius: '100px', border: 'none', backgroundColor: Styles.colors.loading, color: 'white', fontSize: '16px', fontWeight: '700', cursor: (mode === 'review' || currentSelectedAnswer !== undefined) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>{currentQuestionIndex === MOCK_EXAM_QUESTIONS.length - 1 ? (mode === 'review' ? "Đóng" : "Nộp bài") : "Tiếp tục"} <ArrowRight size={20} /></motion.button></div>)}
                    <div style={{ textAlign: 'center', marginTop: '10px' }}><p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><AlertCircle size={12} /> Đây là đề thi mẫu, mô phỏng cho chức năng tạo lập đề thi.</p></div>
                </div>
            </motion.div>
        </div>
    );
};

const FolderUpload = ({ onFileSelect }) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div whileHover="hover" initial="rest" className="relative" style={{ width: 120, height: 90, position: 'relative', cursor: 'pointer' }}>
                <input type="file" onChange={onFileSelect} accept=".pdf" style={{ position: 'absolute', inset: -50, opacity: 0, zIndex: 100, cursor: 'pointer' }} />
                <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: Styles.colors.loading, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <div style={{ position: 'absolute', top: -12, left: 0, width: '40%', height: 12, backgroundColor: Styles.colors.loading, borderRadius: '8px 8px 0 0' }} />
                <motion.div variants={{ rest: { y: 0 }, hover: { y: -15, rotate: -5 } }} style={{ position: 'absolute', bottom: 10, left: 10, right: 10, height: '80%', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', zIndex: 2 }} />
                <motion.div variants={{ rest: { y: 0 }, hover: { y: -25, rotate: 5 } }} style={{ position: 'absolute', bottom: 10, left: 10, right: 10, height: '80%', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '60%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px' }} /></motion.div>
                <motion.div variants={{ rest: { rotateX: 0, y: 0 }, hover: { rotateX: -15, y: 5 } }} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '85%', backgroundColor: Styles.colors.loading, borderRadius: '0 0 12px 12px', zIndex: 10, transformOrigin: 'bottom', perspective: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UploadCloud color="white" size={32} /></motion.div>
                <motion.div variants={{ rest: { opacity: 0 }, hover: { opacity: 0.2 } }} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '85%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)', borderRadius: '0 0 12px 12px', zIndex: 11, pointerEvents: 'none' }} />
            </motion.div>
        </div>
    )
}

const UploadModal = ({ isOpen, onClose, formData, setFormData, onFileSelect, onRemoveFile, onUpload, uploading, documents }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    useEffect(() => {
        if (documents && formData.major) {
            const subjects = new Set();
            documents.forEach(d => { subjects.add(d.title); subjects.add(d.major); });
            const term = Utils.removeTones(formData.major.toLowerCase());
            const filtered = Array.from(subjects).filter(s => Utils.removeTones(s.toLowerCase()).includes(term));
            setFilteredSuggestions(filtered);
        } else { setFilteredSuggestions([]); }
    }, [formData.major, documents]);

    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
           <div className="upload-modal-box">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                 <h2 style={{ margin: 0, fontSize: '20px', color: '#1d1d1f' }}>Đóng góp tài liệu</h2>
                 <InteractiveButton onClick={onClose} customBlackWhite={true} primary={false} style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}><X size={20} /></InteractiveButton>
             </div>
             {!formData.file ? ( <FolderUpload onFileSelect={onFileSelect} /> ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ backgroundColor: '#F5F5F7', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText color="#E53935" size={20}/><div style={{ overflow: 'hidden' }}><div style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', color: '#1d1d1f' }}>{formData.file.name}</div></div></div>
                         <button onClick={onRemoveFile} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#FF4D4F"/></button>
                     </div>
                     <input style={Styles.input} placeholder="Tên hiển thị" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>Chọn khóa:</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['K49', 'K50', 'K51'].map(k => (
                                <button key={k} onClick={() => setFormData({...formData, year: k})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: formData.year === k ? `1px solid ${Styles.colors.primary}` : '1px solid #e0e0e0', backgroundColor: formData.year === k ? Styles.colors.primary : 'transparent', color: formData.year === k ? '#fff' : '#1d1d1f', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}>{k}</button>
                            ))}
                        </div>
                     </div>
                     <div style={{ position: 'relative' }}>
                        <input style={Styles.input} placeholder="Môn (VD: CNTT, Giải tích 1...)" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div style={{ ...Styles.suggestionBox, maxHeight: '200px', overflowY: 'auto' }}>
                                {filteredSuggestions.map((s, i) => <div key={i} style={{ ...Styles.suggestionItem, cursor: 'pointer' }} onMouseDown={() => setFormData({...formData, major: s})}>{s}</div>)}
                            </div>
                        )}
                     </div>
                     <input style={Styles.input} placeholder="Ghi chú thêm..." value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
                     <InteractiveButton primary={true} onClick={onUpload} disabled={uploading} isDarkBg={false} style={{marginTop: '10px'}}>{uploading ? <Loader className="animate-spin" size={16}/> : "Tải lên ngay"}</InteractiveButton>
                 </div>
             )}
           </div>
        </div>
    );
};

const MobileMenu = ({ onNavigate, setIsModalOpen, setIsExamOpen }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mobile-menu-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 'auto' }}>
            <motion.div 
                initial={false} animate={{ height: 'auto' }}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.2)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', minWidth: '200px' }}
            >
                <div onClick={() => setIsOpen(!isOpen)} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', marginRight: '10px' }}>HocLieuSo</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isOpen ? <X color={Styles.colors.orange} size={24} /> : <Menu color={Styles.colors.orange} size={24} />}</motion.div>
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: '5px' }} />
                                <div onClick={() => {onNavigate('home'); setIsOpen(false)}} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Trang chủ</div>
                                <div onClick={() => {onNavigate('all'); setIsOpen(false)}} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Tài liệu</div>
                                <div onClick={() => {setIsExamOpen(true); setIsOpen(false)}} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Tạo đề thi</div>
                                <div onClick={() => {setIsModalOpen(true); setIsOpen(false)}} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}>Đóng góp</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

const Navbar = ({ view, setView, setIsModalOpen, onNavigate, showToast, setIsExamOpen }) => {
    const isHome = view === 'home';
    return (
        <nav className="desktop-nav" style={{ position: 'absolute', top: isHome ? '30px' : '20px', left: '50%', transform: 'translateX(-50%)', width: isHome ? 'calc(100% - 60px)' : '100%', maxWidth: '1200px', backgroundColor: isHome ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: isHome ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, color: isHome ? 'white' : '#1d1d1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '18px', cursor: 'pointer', paddingLeft: '10px' }} onClick={() => onNavigate('home')}>HocLieuSo</div>
            <div style={{ display: 'flex', gap: '4px' }}>
                <NavButton onClick={() => onNavigate('home')} isActive={view === 'home'} isDarkBg={isHome}>Trang chủ</NavButton>
                <NavButton onClick={() => onNavigate('all')} isActive={view === 'all'} isDarkBg={isHome}>Tài liệu</NavButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '4px' }}>
                <InteractiveButton onClick={() => setIsExamOpen(true)} primary={false} isDarkBg={isHome} isNav={true} isUpload={true} style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FilePenLine size={20} /></InteractiveButton>
                <InteractiveButton onClick={() => setIsModalOpen(true)} primary={false} isDarkBg={isHome} isNav={true} isUpload={true} style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UploadCloud size={20} /></InteractiveButton>
            </div>
        </nav>
    );
};

const HeroSection = ({ scrollY, points }) => {
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const floatLeft = useTransform(scrollY, [0, 400], [0, -100]);
    const floatRight = useTransform(scrollY, [0, 400], [0, 100]);

    return (
        <div style={{ position: 'relative', margin: '10px', height: '95vh', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CONFIG.HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            <motion.header style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', opacity: heroOpacity }}>
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '20px', display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', padding: '8px 20px', borderRadius: '30px', fontWeight: '600', fontSize: '13px', backdropFilter: 'blur(5px)' }}>KHO TÀI LIỆU SINH VIÊN</motion.div>
                <div style={{ overflow: 'visible' }}>
                    <motion.h1 initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ x: floatLeft, fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: 1 }}>Less Paper</motion.h1>
                    <motion.h1 initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }} style={{ x: floatRight, fontSize: 'clamp(50px, 9vw, 80px)', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: 1 }}>More Knowledge.</motion.h1>
                </div>
            </motion.header>
            <PointsWidget points={points} />
        </div>
    );
};

const ImpactDashboard = () => {
    const totalViews = 12500; 
    const papersSaved = totalViews * 5;
    const waterSaved = Math.floor(papersSaved * 0.01); 
    const co2Reduced = (papersSaved * 0.005).toFixed(1); 
    const [hoveredCard, setHoveredCard] = useState(1);
    const cards = [
        { id: 1, label: "Papers Saved", sub: "Chuyển đổi số giúp hạn chế khai thác gỗ, giữ lại lá phổi xanh vô giá cho Trái Đất.", value: papersSaved, icon: <FileText size={16} color="white" />, image: CONFIG.DASHBOARD_IMGS.PAPER, color: "#4CAF50" },
        { id: 2, label: "Water Saved", sub: "Tiết kiệm nguồn nước sạch quý báu vốn bị tiêu tốn khổng lồ trong công nghiệp sản xuất giấy.", value: waterSaved, icon: <Droplets size={16} color="white" />, image: CONFIG.DASHBOARD_IMGS.WATER, color: "#2196F3" },
        { id: 3, label: "CO2 Reduced", sub: "Cắt giảm khí thải từ quy trình in ấn và vận chuyển, chung tay đẩy lùi biến đổi khí hậu.", value: co2Reduced, unit: "kg", icon: <Wind size={16} color="white" />, image: CONFIG.DASHBOARD_IMGS.CO2, color: "#FF9800" }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '80px auto 40px', padding: '0 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <ScrollFloat as="h2" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', lineHeight: 1, margin: '0 0 16px 0', color: '#1d1d1f', letterSpacing: '-1px' }}>"Tác Động Xanh"</ScrollFloat>
                <ScrollFloat as="p" style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>Mỗi lượt xem tài liệu hay tạo đề thi không chỉ giúp học tập hiệu quả hơn mà còn góp phần bảo vệ môi trường.</ScrollFloat>
            </div>
            <div className="dashboard-container">
                {cards.map((card) => {
                    const isActive = hoveredCard === card.id;
                    return (
                        <motion.div key={card.id} className="dashboard-card" onHoverStart={() => setHoveredCard(card.id)} layout transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ flex: isActive ? 3 : 1, position: 'relative', borderRadius: '32px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', minWidth: '100px' }}>
                            <motion.div animate={{ scale: isActive ? 1.05 : 1 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${card.image})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }} />
                            <div style={{ position: 'absolute', inset: 0, zIndex: 2, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ width: '100%', paddingRight: '10px' }}>
                                        <motion.h3 layout="position" style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', lineHeight: 1.1 }}>{card.label}</motion.h3>
                                        <motion.p layout="position" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', margin: 0 }}>{card.sub}</motion.p>
                                    </div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', flexShrink: 0 }}><ArrowRight size={20} /></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        {card.icon}
                                        {isActive && <motion.span initial={{opacity:0}} animate={{opacity:1}} style={{ color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace:'nowrap' }}>Live Data</motion.span>}
                                    </div>
                                     <motion.div layout="position" style={{ fontSize: '40px', fontWeight: '800', color: 'white', lineHeight: 1, textAlign: 'right' }}>
                                        {card.value}{card.unit && <span style={{ fontSize: '20px', marginLeft: '4px' }}>{card.unit}</span>}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const FAQS = [
        { q: "Tài liệu được kiểm duyệt như thế nào?", a: "Trong thời gian tới, hệ thống sẽ bổ sung cơ chế kiểm duyệt chặt chẽ hơn để đảm bảo tính chính xác, học thuật và chất lượng của toàn bộ nội dung." },
        { q: "Tài khoản người dùng hoạt động thế nào?", a: "Tính năng tài khoản hiện vẫn đang trong giai đoạn phát triển. Trong tương lai, người dùng sẽ có hồ sơ cá nhân, lịch sử đóng góp, quyền quản lý điểm và nhiều tiện ích bổ sung khác phục vụ học tập và cộng đồng." },
        { q: "Nền tảng có miễn phí không?", a: "Hiện tại, mọi tính năng đều hoàn toàn miễn phí. Trong tương lai, nền tảng có thể bổ sung các gói đặc quyền nâng cao, nhưng cốt lõi truy cập tài liệu và chia sẻ tri thức sẽ luôn được duy trì ở mức phi lợi nhuận cho sinh viên." },
        { q: "Điểm dùng để làm gì?", a: "Điểm là đơn vị giá trị trong hệ thống, được sử dụng để mở khóa các đặc quyền và đổi lấy những lợi ích khác khi nền tảng mở rộng trong tương lai." },
    ];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 20px' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {FAQS.map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1, delay: i * 0.1 }} style={{ borderRadius: '32px', overflow: 'hidden', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #1d1d1f', color: '#1d1d1f' }}>
                            <div onClick={() => setActiveIndex(activeIndex === i ? null : i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#1d1d1f' }}>{item.q}</h3>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }}>
                                    <motion.div animate={{ rotate: activeIndex === i ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown size={20} color="#1d1d1f"/></motion.div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {activeIndex === i && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                                        <div style={{ padding: '0 32px 32px 32px' }}><p style={{ margin: 0, color: '#666', lineHeight: 1.6, fontSize: '1rem' }}>{item.a}</p></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const SearchSection = ({ searchTerm, setSearchTerm, suggestions, onSelectSuggestion }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => { if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) setShowSuggestions(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
            <div ref={searchContainerRef} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                <Search color="#999" style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <input placeholder="Tìm kiếm tài liệu (VD: Giải tích)..." style={Styles.searchStyleFixed} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); if(e.target.value.length > 0) setShowSuggestions(true); }} onFocus={() => { if(searchTerm.length > 0) setShowSuggestions(true); }} />
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div key="suggestions" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={Styles.suggestionBox}>
                            {suggestions.map(doc => (
                                <div key={doc.id} className="suggestion-item" onClick={() => { onSelectSuggestion(doc); setShowSuggestions(false); }} style={Styles.suggestionItem}>
                                    <FileText size={16} color="#666"/>
                                    <div><div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>{doc.title}</div><div style={{ fontSize: '12px', color: '#888' }}>{doc.major} • {doc.year}</div></div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <InteractiveButton primary={true} style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 28px' }} isDarkBg={false} customBlackWhite={true}>Tìm kiếm</InteractiveButton>
            </div>
        </div>
    );
};

const FeedbackSection = ({ onSend }) => {
    const [value, setValue] = useState("");
    const handleSubmit = () => { if (!value.trim()) return; onSend(value); setValue(""); };
    const socialLinks = [
        { icon: <Instagram size={20} />, url: "https://www.instagram.com/xxisep.gm/" },
        { icon: <Facebook size={20} />, url: "https://www.facebook.com/gmpty2109/" },
        { icon: <Github size={20} />, url: "https://github.com/gmaanx" },
        { icon: <FilePenLine size={20} />, url: "https://docs.google.com/forms/d/e/1FAIpQLSc1BbDc9aNBQtEvXNbc1fcriQEjcCCRPxptXL3F7rI0TympBA/viewform" } 
    ];

    return (
        <div style={{ marginTop: '40px', marginBottom: '0px', width: 'calc(100% - 40px)', height: '500px', borderRadius: '40px', overflow: 'hidden', position: 'relative', margin: '40px auto 0px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CONFIG.FEEDBACK_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            <div style={{ position: 'relative', zIndex: 2, width: '90%', maxWidth: '500px', textAlign: 'center', color: '#fff', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '20px' }}>Đóng góp ý kiến</h2>
                <div style={{ display: 'flex', gap: '5px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '50px' }}>
                    <input placeholder="Bạn nghĩ gì..." style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 20px', fontSize: '15px', color: '#000', outline: 'none' }} value={value} onChange={(e) => setValue(e.target.value)} />
                    <InteractiveButton onClick={handleSubmit} primary={false} style={{ padding: '12px 30px' }} isDarkBg={false} customBlackWhite={true}>Gửi</InteractiveButton>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px', backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', gap: '20px', zIndex: 3 }}>
                {socialLinks.map((item, i) => (
                    <motion.a key={i} href={item.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, backgroundColor: 'rgba(255,255,255,0.2)', rotate: 5 }} whileTap={{ scale: 0.9 }} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(5px)', textDecoration: 'none' }}>{item.icon}</motion.a>
                ))}
            </div>
        </div>
    );
};

const Footer = () => (
    <div style={{ textAlign: 'center', padding: '15px 0 30px 0', backgroundColor: '#fff', color: '#1d1d1f' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', opacity: 0.8 }}>Made by <span style={{ fontFamily: 'NVN-Motherland-Signature-1, cursive', fontSize: '20px', fontWeight: '700' }}>Gia Man</span></p>
    </div>
);

const DocumentGrid = ({ documents, onView, activeMobileDocId, setActiveMobileDocId }) => (
    <div className="menu-grid">
        {documents.length > 0 ? ( 
            documents.map(item => (
                <MenuCard 
                    key={item.id} 
                    item={item} 
                    onClick={() => onView(item)} 
                    activeMobileId={activeMobileDocId} 
                    setActiveMobileId={setActiveMobileDocId} 
                />
            )) 
        ) : ( 
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: '#999' }}>Không tìm thấy tài liệu phù hợp.</div> 
        )}
    </div>
);

export default function App() {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExamOpen, setIsExamOpen] = useState(false); 
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', desc: '', year: '', major: '', file: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [points, setPoints] = useState(100);
  const [activeMobileDocId, setActiveMobileDocId] = useState(null);
  
  const { scrollY } = useScroll();

  useEffect(() => {
    if (!window.Lenis) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js";
        script.async = true;
        script.onload = () => {
            const lenis = new window.Lenis({
                duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), direction: 'vertical', gestureDirection: 'vertical', smooth: true, mouseMultiplier: 1, smoothTouch: false, touchMultiplier: 2,
            });
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        };
        document.body.appendChild(script);
    }
  }, []);

  useEffect(() => { 
      const savedDocs = localStorage.getItem('hoclieuso_docs');
      if (savedDocs) { setDocuments(JSON.parse(savedDocs)); } else { setDocuments(INITIAL_DOCS); }
      Object.values(CONFIG.DASHBOARD_IMGS).forEach(src => { const img = new Image(); img.src = src; });
      const timer = setTimeout(() => setIsLoading(false), 2000); 
      return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      if (searchTerm.length > 0) {
          const scoredDocs = documents.map(doc => ({ ...doc, score: Utils.calcScore(doc, searchTerm) })).filter(doc => doc.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
          setSuggestions(scoredDocs);
      } else { setSuggestions([]); }
  }, [searchTerm, documents]);

  const getDisplayDocuments = () => {
      let docs = documents;
      if (activeTab !== 'All') docs = docs.filter(doc => doc.year === activeTab);
      if (searchTerm.trim() !== '') docs = docs.map(doc => ({ ...doc, score: Utils.calcScore(doc, searchTerm) })).filter(doc => doc.score > 0).sort((a, b) => b.score - a.score);
      return docs;
  };

  const handleNavigation = (newView) => {
      if (view === newView) return;
      setIsLoading(true);
      setTimeout(() => {
          setView(newView); setIsLoading(false); window.scrollTo({ top: 0, behavior: 'instant' });
      }, 800);
  };

  const showToast = (message) => {
      setToastMessage(message); setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpload = () => {
      if (!formData.file || !formData.title || !formData.year || !formData.major) return showToast("Vui lòng nhập đủ thông tin!");
      setUploading(true);
      setTimeout(() => {
          const reader = new FileReader();
          reader.onload = (e) => {
              try {
                  const newDoc = { id: Date.now(), title: formData.title, desc: formData.desc || "Tài liệu sinh viên", year: formData.year, major: formData.major, type: "PDF", fileUrl: e.target.result, cover: Utils.getRandomCover(), createdAt: new Date().toISOString() };
                  const updatedDocs = [newDoc, ...documents];
                  setDocuments(updatedDocs); 
                  try { localStorage.setItem('hoclieuso_docs', JSON.stringify(updatedDocs)); } catch (e) { console.warn("Quota exceeded"); }
                  setUploading(false); setIsModalOpen(false); setFormData({ title: '', desc: '', year: '', major: '', file: null });
                  showToast("Upload thành công! +1 Điểm thưởng"); setPoints(prev => prev + 1);
              } catch(err) { console.error(err); setUploading(false); showToast("Lỗi xử lý file"); }
          };
          reader.onerror = () => { setUploading(false); showToast("Lỗi đọc file"); };
          reader.readAsDataURL(formData.file);
      }, 1500); 
  };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") setFormData({ ...formData, file: file, title: file.name.replace(/\.pdf$/i, "") });
      else showToast("Chỉ nhận file PDF!");
  };

  return (
    <>
      <style>{Styles.global}</style>
      <Navbar view={view} setView={setView} setIsModalOpen={setIsModalOpen} onNavigate={handleNavigation} showToast={showToast} setIsExamOpen={setIsExamOpen} />
      <MobileMenu onNavigate={handleNavigation} setIsModalOpen={setIsModalOpen} setIsExamOpen={setIsExamOpen} />
      <AnimatePresence>
          {isLoading && <IntroLoader key="loader" onComplete={() => setIsLoading(false)} />}
          {toastMessage && <Toast key="toast" message={toastMessage} />}
          {viewingDoc && <DocViewer key="doc-viewer" doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      </AnimatePresence>
      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <AnimatePresence mode="wait">
            {view === 'home' && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <HeroSection scrollY={scrollY} points={points} />
                    <div style={{ marginTop: '80px' }}>
                        <div style={{ marginBottom: '80px' }}>
                            <ScrollRevealText text="Giảm thời gian tìm kiếm, tăng hiệu quả học tập. Tất cả tài liệu và đề thi được sắp xếp thông minh để bạn tiếp cận đúng thứ mình cần chỉ trong vài giây." />
                        </div>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            <ScrollFloat as="h2" style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '800', lineHeight: 1, margin: 0, color: '#1d1d1f' }}>"Tài Liệu Mới"</ScrollFloat>
                            <ScrollFloat as="div" delay={0.5}>
                                <InteractiveButton primary={false} isDarkBg={false} onClick={() => handleNavigation('all')} customBlackWhite={true}>Xem tất cả <ArrowRight size={16}/></InteractiveButton>
                            </ScrollFloat>
                        </div>
                        <DocumentGrid 
                            documents={documents.slice(0, 4)} 
                            onView={(doc) => setViewingDoc(doc)} 
                            activeMobileDocId={activeMobileDocId}
                            setActiveMobileDocId={setActiveMobileDocId}
                        />
                    </div>
                    <ImpactDashboard />
                    <FAQSection />
                    <FeedbackSection onSend={() => showToast("Cảm ơn đóng góp của bạn!")} />
                    <Footer />
                </motion.div>
            )}
            {view === 'all' && (
                <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ paddingTop: '100px', minHeight: '100vh', color: '#1d1d1f', position: 'relative', zIndex: 10 }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <h1 style={{ fontSize: 'clamp(30px, 5vw, 60px)', fontWeight: '900', color: '#1d1d1f', margin: '0 0 20px 0', textTransform: 'uppercase', letterSpacing: '-1px' }}>KHO TÀI LIỆU</h1>
                            <p style={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Truy cập không giới hạn vào kho tàng tri thức.</p>
                        </div>
                        <SearchSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} suggestions={suggestions} onSelectSuggestion={(doc) => setSearchTerm(doc.title)} />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '60px', flexWrap: 'wrap' }}>
                            {['All', 'K49', 'K50', 'K51'].map(tab => (
                                <InteractiveButton key={tab} primary={activeTab === tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 32px', fontSize: '15px' }} isDarkBg={false}>{tab === 'All' ? 'Tất cả' : `Khóa ${tab}`}</InteractiveButton>
                            ))}
                        </div>
                        <DocumentGrid 
                            documents={getDisplayDocuments()} 
                            onView={(doc) => setViewingDoc(doc)} 
                            activeMobileDocId={activeMobileDocId}
                            setActiveMobileDocId={setActiveMobileDocId}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} formData={formData} setFormData={setFormData} onFileSelect={handleFileSelect} onRemoveFile={() => setFormData({ title: '', desc: '', year: '', major: '', file: null })} onUpload={handleUpload} uploading={uploading} documents={documents} />
      <ExamModal isOpen={isExamOpen} onClose={() => setIsExamOpen(false)} />
    </>
  );
}