import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import { Search, X, ArrowRight, FileText, Instagram, Twitter, Facebook, Mail, UploadCloud, Loader, Trash2, Heart, CheckCircle2, Play, Pause, RotateCcw, Moon, Sun, FilePenLine, TreeDeciduous, Droplets, Wind } from 'lucide-react';

// --- 1. CONFIGURATION & MOCK DATA ---
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

// --- 2. UTILITIES ---
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

// --- 3. STYLES ---
const Styles = {
    colors: { 
        primary: '#1d1d1f', 
        white: '#ffffff', 
        orange: '#f97316', // Quay về màu cam gốc cho toàn app
        loading: '#007E6E', // Màu xanh ngọc CHỈ DÙNG CHO LOADING
        green: '#34C759', 
        gray: '#e0e0e0', 
        lightGray: '#f5f5f7' 
    },
    global: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap'); 
        :root, body, #root { width: 100%; margin: 0; padding: 0; background-color: #ffffff; font-family: "Montserrat", sans-serif; overflow-x: hidden; scroll-behavior: auto !important; }
        html.lenis { height: auto; } 
        .lenis.lenis-smooth { scroll-behavior: auto; } 
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; } 
        .lenis.lenis-stopped { overflow: hidden; } 
        .lenis.lenis-scrolling iframe { pointer-events: none; } 
        .menu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; padding: 40px; }
        @media (max-width: 768px) { .menu-grid { grid-template-columns: 1fr; padding: 20px; } }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #bbb; border-radius: 10px; }
        .suggestion-item:hover { background-color: #f5f5f7; cursor: pointer; }
    `,
    searchStyleFixed: { width: '100%', padding: '18px 140px 18px 50px', borderRadius: '50px', background: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box', border: '1px solid #e0e0e0', color: '#1d1d1f' },
    suggestionBox: { position: 'absolute', top: '100%', left: '20px', right: '20px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden', marginTop: '10px', border: '1px solid #f0f0f0' },
    suggestionItem: { padding: '12px 20px', borderBottom: '1px solid #f5f5f7', display: 'flex', alignItems: 'center', gap: '10px' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', background: '#f5f5f7', border: 'none', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1d1d1f', fontWeight: '500' },
    glassTag: { fontSize: '11px', fontWeight: '700', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', color: '#fff', backdropFilter: 'blur(5px)' }
};

// --- 4. UI COMPONENTS ---
const NavButton = ({ children, onClick, isActive, isDarkBg }) => {
  const activeBg = isDarkBg ? Styles.colors.white : Styles.colors.primary;
  const activeColor = isDarkBg ? Styles.colors.primary : Styles.colors.white;
  const initialBorder = isDarkBg ? `1px solid ${Styles.colors.white}` : `1px solid rgba(0,0,0,0.1)`;
  return (
    <motion.button onClick={onClick} animate={{ backgroundColor: isActive ? activeBg : "transparent", color: isActive ? activeColor : (isDarkBg ? Styles.colors.white : Styles.colors.primary), border: isActive ? "1px solid transparent" : initialBorder }} whileHover={{ backgroundColor: activeBg, color: activeColor, border: "1px solid transparent", scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }} style={{ padding: '8px 20px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', margin: '0 4px' }}>{children}</motion.button>
  );
};

const InteractiveButton = ({ primary = true, children, onClick, style, className, disabled, icon, isDarkBg = false, customBlackWhite = false, isNav = false, isUpload = false }) => {
    let bgInitial, textInitial, borderInitial, bgHover, textHover, borderHover;
    if (isUpload) {
        if (isDarkBg) { bgInitial = "transparent"; borderInitial = "#ffffff"; textInitial = Styles.colors.orange; bgHover = Styles.colors.orange; borderHover = "#ffffff"; textHover = "#ffffff"; }
        else { bgInitial = "transparent"; borderInitial = "#1d1d1f"; textInitial = Styles.colors.orange; bgHover = Styles.colors.orange; borderHover = "#1d1d1f"; textHover = "#ffffff"; }
    } else if (isNav && isDarkBg) { bgInitial = "transparent"; textInitial = "#ffffff"; borderInitial = "#ffffff"; bgHover = "#ffffff"; textHover = "#1d1d1f"; borderHover = "transparent"; }
    else if (customBlackWhite) { bgInitial = "#1d1d1f"; textInitial = "#ffffff"; borderInitial = "#1d1d1f"; bgHover = "#ffffff"; textHover = "#1d1d1f"; borderHover = "#1d1d1f"; }
    else { bgInitial = primary ? (isDarkBg ? "#ffffff" : "#1d1d1f") : "transparent"; textInitial = primary ? (isDarkBg ? "#1d1d1f" : "#ffffff") : (isDarkBg ? "#ffffff" : "#1d1d1f"); borderInitial = primary ? "transparent" : (isDarkBg ? "#ffffff" : "#1d1d1f"); bgHover = primary ? (isDarkBg ? "#e0e0e0" : "#333") : (isDarkBg ? "#ffffff" : "#1d1d1f"); textHover = primary ? (isDarkBg ? "#1d1d1f" : "#ffffff") : (isDarkBg ? "#1d1d1f" : "#ffffff"); borderInitial = primary ? "transparent" : (isDarkBg ? "#ffffff" : "#1d1d1f"); }
    return (
        <motion.button onClick={onClick} disabled={disabled} initial={false} animate={{ backgroundColor: bgInitial, color: textInitial, border: `1px solid ${borderInitial}`, opacity: disabled ? 0.7 : 1 }} whileHover={!disabled ? { backgroundColor: bgHover, color: textHover, borderColor: borderHover || (primary ? "transparent" : borderInitial), scale: 1.05 } : {}} whileTap={!disabled ? { scale: 0.95 } : {}} transition={{ duration: 0.2 }} style={{ padding: '12px 28px', borderRadius: '50px', fontWeight: '700', fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...style }} className={className}>{children} {icon && icon}</motion.button>
    );
};

const MenuCard = ({ item, onClick }) => {
  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" onClick={onClick} style={{ position: 'relative', height: '450px', borderRadius: '30px', overflow: 'hidden', cursor: 'pointer', background: '#000', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }} transition={{ duration: 0.8, ease: "easeInOut" }} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${item.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)', zIndex: 1 }} />
      <motion.div variants={{ rest: { backgroundColor: "rgba(255,255,255,0)", color: "#ffffff", scale: 1 }, hover: { backgroundColor: "#ffffff", color: "#000000", scale: 1.1 } }} transition={{ duration: 0.3 }} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 3, width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> <ArrowRight size={24} /> </motion.div>
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

const PressureChar = ({ char, mouseX }) => {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    const [x, setX] = useState(0);
    useEffect(() => { if (ref.current) { setWidth(ref.current.offsetWidth); setX(ref.current.offsetLeft); } }, []);
    const distance = useTransform(mouseX, (val) => { const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }; return val - bounds.x - bounds.width / 2; });
    const scaleY = useTransform(distance, [-200, 0, 200], [1, 0.8, 1]);
    const scaleX = useTransform(distance, [-200, 0, 200], [1, 1.1, 1]);
    return <motion.span ref={ref} style={{ display: 'inline-block', scaleY, scaleX, originY: "center", marginRight: char === ' ' ? '10px' : '0px' }}>{char}</motion.span>;
};

const TextPressure = ({ text }) => {
    const mouseX = useMotionValue(0);
    return (
        <div onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)} style={{ display: 'flex', justifyContent: 'center', cursor: 'default', overflow: 'hidden', padding: '10px 0', fontSize: 'clamp(30px, 5vw, 60px)', fontWeight: '900', color: '#1d1d1f', textTransform: 'uppercase', lineHeight: 1 }}>
            {text.split('').map((char, i) => (<PressureChar key={i} char={char} mouseX={mouseX} />))}
        </div>
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

// [UPDATED] COUNTER PRELOADER - Sử dụng màu xanh Styles.colors.loading
const CounterPreloader = ({ onComplete }) => {
    const [count, setCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const duration = 2000; 
        const interval = 20;
        const steps = duration / interval;
        const increment = 100 / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= 100) {
                current = 100;
                clearInterval(timer);
                setIsFinished(true); 
                setTimeout(onComplete, 900); 
            }
            setCount(Math.floor(current));
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <motion.div
            animate={isFinished ? { y: "-100%" } : { y: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: '#1d1d1f',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff'
            }}
        >
            {/* Flexbox căn chỉnh số và % */}
            <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 0.8 }}>
                <motion.h1 
                    style={{ 
                        fontSize: 'clamp(80px, 15vw, 150px)', fontWeight: '900', 
                        margin: 0, letterSpacing: '-0.05em',
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: 'Montserrat, sans-serif'
                    }}
                >
                    {count}
                </motion.h1>
                <span style={{ 
                    fontSize: 'clamp(20px, 4vw, 40px)', fontWeight: '700', 
                    marginTop: '10px', // Căn chỉnh vị trí dấu %
                    color: Styles.colors.loading // MÀU XANH
                }}>%</span>
            </div>
            
            {/* Thanh loading bar */}
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: isFinished ? 300 : (count / 100) * 300 }} 
                transition={{ ease: "linear", duration: 0.1 }} 
                style={{ height: '4px', background: Styles.colors.loading, marginTop: '20px', borderRadius: '2px' }} // MÀU XANH
            />
        </motion.div>
    );
};

// --- 5. WIDGETS & SPECIAL COMPONENTS ---

const PomodoroHeaderWidget = () => {
    const WORK_TIME = 30; const BREAK_TIME = 30; 
    const [timeLeft, setTimeLeft] = useState(WORK_TIME); const [isActive, setIsActive] = useState(false); const [mode, setMode] = useState('work'); 
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 10px', background: '#f5f5f7', borderRadius: '30px', border: '1px solid #e0e0e0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: themeColor, minWidth: '45px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={toggleTimer} style={{ background: themeColor, border: 'none', borderRadius: '12px', padding: '4px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isActive ? "PAUSE" : "START"}</button>
                <button onClick={resetTimer} style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>RESET</button>
            </div>
            <span style={{ fontSize: '10px', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '4px' }}>{mode === 'work' ? 'FOCUS' : 'BREAK'}</span>
        </div>
    );
};

const ThemeSwitchFixed = ({ isNightMode, toggle }) => {
    return (
        <div onClick={toggle} style={{ width: '56px', height: '32px', backgroundColor: isNightMode ? '#27272a' : '#f4f4f5', borderRadius: '99px', display: 'flex', alignItems: 'center', padding: '4px', cursor: 'pointer', border: `1px solid ${isNightMode ? '#3f3f46' : '#e4e4e7'}`, justifyContent: isNightMode ? 'flex-end' : 'flex-start' }}>
            <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} style={{ width: '24px', height: '24px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                 <AnimatePresence mode='wait'>
                    <motion.div key={isNightMode ? 'moon' : 'sun'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>{isNightMode ? <Moon size={14} color="#1d1d1f" /> : <Sun size={14} color={Styles.colors.orange} fill={Styles.colors.orange} />}</motion.div>
                 </AnimatePresence>
            </motion.div>
        </div>
    )
}

const DocViewer = ({ doc, onClose }) => {
    const [isNightMode, setIsNightMode] = useState(false);
    if (!doc) return null;
    const contentFilter = isNightMode ? 'invert(1) hue-rotate(180deg)' : 'none';
    const bgColor = isNightMode ? '#1a1a1a' : 'white';
    const headerBg = isNightMode ? '#222' : '#fff';
    const textColor = isNightMode ? '#eee' : '#1d1d1f';
    const subTextColor = isNightMode ? '#aaa' : '#666';
    const borderColor = isNightMode ? '#333' : '#eee';
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '1000px', height: '90vh', background: bgColor, borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transition: 'background-color 0.3s ease' }}>
                <div style={{ padding: '12px 24px', borderBottom: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: headerBg, transition: 'background-color 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, overflow: 'hidden' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: isNightMode ? '#333' : '#f5f5f7', flexShrink: 0, transition: 'background-color 0.3s ease' }}><FileText size={20} color={textColor}/></div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.3s ease' }}>{doc.title}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: subTextColor, transition: 'color 0.3s ease' }}>{doc.year} • {doc.major}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <PomodoroHeaderWidget />
                        <ThemeSwitchFixed isNightMode={isNightMode} toggle={() => setIsNightMode(!isNightMode)} />
                        <button onClick={onClose} style={{ padding: '8px', borderRadius: '50%', border: 'none', background: isNightMode ? '#333' : '#f5f5f7', cursor: 'pointer', color: textColor, flexShrink: 0, transition: 'all 0.3s ease' }}><X size={20}/></button>
                    </div>
                </div>
                <div style={{ flex: 1, background: isNightMode ? '#121212' : '#f9fafb', position: 'relative', filter: contentFilter, transition: 'all 0.3s ease' }}>
                    {doc.fileUrl && doc.fileUrl !== "#" ? (<iframe src={doc.fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document Viewer" />) : (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', gap: '16px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={32} color="#ccc" /></div><p style={{ fontSize: '15px' }}>Đây là dữ liệu mẫu, chưa có file đính kèm.</p></div>)}
                </div>
            </motion.div>
        </div>
    );
};

const Toast = ({ message }) => (
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{ position: 'fixed', bottom: '40px', left: '50%', x: '-50%', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', padding: '12px 24px', borderRadius: '100px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 9999, border: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
        <div style={{ width: '22px', height: '22px', background: '#34C759', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={14} color="white" strokeWidth={3} /></div>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>{message}</span>
    </motion.div>
);

const AnimatedCounter = ({ from, to, duration = 2 }) => {
    const nodeRef = useRef();
    useEffect(() => {
      const node = nodeRef.current;
      let startTime;
      const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
          const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentValue = Math.floor(from + (to - from) * easedProgress);
          if (node) { node.textContent = currentValue.toLocaleString(); }
          if (progress < 1) { requestAnimationFrame(step); }
      };
      requestAnimationFrame(step);
    }, [from, to, duration]);
    return <span ref={nodeRef}>{from}</span>;
};

// [UPDATED] IMPACT DASHBOARD WITH ACCORDION EFFECT
const ImpactDashboard = () => {
    const totalViews = 12500; 
    const papersSaved = totalViews * 5;
    const waterSaved = Math.floor(papersSaved * 0.01); 
    const co2Reduced = (papersSaved * 0.005).toFixed(1); 

    // State để theo dõi thẻ nào đang được hover
    const [hoveredCard, setHoveredCard] = useState(1); // Mặc định thẻ đầu tiên mở

    const cards = [
        { id: 1, label: "Papers Saved", sub: "Số giấy tiết kiệm", value: papersSaved, icon: <FileText size={20} color="white" />, image: CONFIG.DASHBOARD_IMGS.PAPER, color: "#4CAF50" },
        { id: 2, label: "Water Saved", sub: "Lít nước bảo vệ", value: waterSaved, icon: <Droplets size={20} color="white" />, image: CONFIG.DASHBOARD_IMGS.WATER, color: "#2196F3" },
        { id: 3, label: "CO2 Reduced", sub: "Kg khí thải giảm", value: co2Reduced, unit: "kg", icon: <Wind size={20} color="white" />, image: CONFIG.DASHBOARD_IMGS.CO2, color: "#FF9800" }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '80px auto 40px', padding: '0 40px' }}>
            {/* TITLE SECTION WITH FLOAT IN/OUT */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: false, margin: "-100px" }} 
                    transition={{ duration: 1.0, ease: "easeOut" }} 
                    style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', lineHeight: 1, margin: '0 0 16px 0', color: '#1d1d1f', letterSpacing: '-1px' }}
                >
                    Tác Động Xanh
                </motion.h2>
                
                <motion.p 
                     initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
                     style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}
                >
                    Mỗi lượt xem tài liệu hay tạo đề thi không chỉ giúp học tập hiệu quả hơn mà còn góp phần bảo vệ môi trường.
                </motion.p>
            </div>

            {/* CARDS FLEX CONTAINER (ACCORDION) */}
            <div style={{ display: 'flex', gap: '20px', height: '350px' }}>
                {cards.map((card) => {
                    const isActive = hoveredCard === card.id;
                    return (
                        <motion.div
                            key={card.id}
                            onHoverStart={() => setHoveredCard(card.id)} // Hover để mở
                            layout // Kích hoạt layout animation tự động
                            transition={{ type: "spring", stiffness: 120, damping: 20 }} // Hiệu ứng co giãn mượt, chậm hơn
                            style={{ 
                                flex: isActive ? 3 : 1, // Active chiếm 3 phần, còn lại 1 phần
                                position: 'relative', borderRadius: '30px', overflow: 'hidden', 
                                cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                minWidth: '100px' // Đảm bảo không bị co quá nhỏ
                            }}
                        >
                            {/* Background Image */}
                            <motion.div 
                                animate={{ scale: isActive ? 1.1 : 1 }} // Zoom ảnh nhẹ khi active
                                transition={{ duration: 0.8 }}
                                style={{ 
                                    position: 'absolute', inset: 0, backgroundImage: `url(${card.image})`, 
                                    backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 
                                }} 
                            />
                            
                            {/* Overlay */}
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)', zIndex: 1 }} />
                            
                            {/* Content */}
                            <div style={{ position: 'absolute', inset: 0, zIndex: 2, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                {/* Top: Icon + Label */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                                        {card.icon}
                                    </div>
                                    {/* Chỉ hiện chữ khi thẻ active (hoặc có thể dùng opacity animation) */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                                            >
                                                <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{card.label}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{card.sub}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Bottom: Big Number + Arrow */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                     <motion.div layout style={{ fontSize: isActive ? '48px' : '32px', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                                        {card.id === 3 ? card.value : <AnimatedCounter from={0} to={card.value} />} 
                                        {card.unit && <span style={{ fontSize: '24px', marginLeft: '5px' }}>{card.unit}</span>}
                                    </motion.div>

                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                            style={{ 
                                                width: '40px', height: '40px', borderRadius: '50%', background: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black'
                                            }}
                                        >
                                            <ArrowRight size={20} />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// --- 6. SECTIONS ---

const Navbar = ({ view, setView, setIsModalOpen, onNavigate }) => {
    const isHome = view === 'home';
    return (
        <nav style={{ position: 'absolute', top: isHome ? '30px' : '20px', left: '50%', transform: 'translateX(-50%)', width: isHome ? 'calc(100% - 60px)' : '100%', maxWidth: '1200px', background: isHome ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: isHome ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', padding: '8px 20px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, color: isHome ? 'white' : '#1d1d1f' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '18px', cursor: 'pointer', paddingLeft: '10px' }} onClick={() => onNavigate('home')}>HocLieuSo</div>
            <div style={{ display: 'flex', gap: '4px' }}>
                <NavButton onClick={() => onNavigate('home')} isActive={view === 'home'} isDarkBg={isHome}>Trang chủ</NavButton>
                <NavButton onClick={() => onNavigate('all')} isActive={view === 'all'} isDarkBg={isHome}>Tài liệu</NavButton>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '4px' }}>
                {/* Nút Tạo Đề Thi Mới */}
                <InteractiveButton onClick={() => alert("Tính năng tạo đề thi đang phát triển!")} primary={false} isDarkBg={isHome} isNav={true} isUpload={true} style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FilePenLine size={20} />
                </InteractiveButton>
                {/* Nút Upload */}
                <InteractiveButton onClick={() => setIsModalOpen(true)} primary={false} isDarkBg={isHome} isNav={true} isUpload={true} style={{ width: '44px', height: '44px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UploadCloud size={20} />
                </InteractiveButton>
            </div>
        </nav>
    );
};

const HeroSection = ({ scrollY }) => {
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const floatLeft = useTransform(scrollY, [0, 400], [0, -100]);
    const floatRight = useTransform(scrollY, [0, 400], [0, 100]);

    return (
        <div style={{ position: 'relative', margin: '10px', height: '95vh', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CONFIG.HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            <motion.header style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', opacity: heroOpacity }}>
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: '20px', display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '8px 20px', borderRadius: '30px', fontWeight: '600', fontSize: '13px', backdropFilter: 'blur(5px)' }}>KHO TÀI LIỆU SINH VIÊN</motion.div>
                <div style={{ overflow: 'visible' }}>
                    <motion.h1 initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} style={{ x: floatLeft, fontSize: 'clamp(50px, 9vw, 100px)', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: 1 }}>Less Paper</motion.h1>
                    <motion.h1 initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }} style={{ x: floatRight, fontSize: 'clamp(50px, 9vw, 100px)', fontWeight: '800', color: '#ffffff', margin: 0, lineHeight: 1 }}>More Knowledge.</motion.h1>
                </div>
            </motion.header>
        </div>
    );
};

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
                <input 
                    placeholder="Tìm kiếm tài liệu (VD: Giải tích)..." 
                    style={Styles.searchStyleFixed} 
                    value={searchTerm} 
                    onChange={(e) => { 
                        setSearchTerm(e.target.value); 
                        if(e.target.value.length > 0) setShowSuggestions(true); 
                    }} 
                    onFocus={() => { if(searchTerm.length > 0) setShowSuggestions(true); }} 
                />
                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={Styles.suggestionBox}>
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

    const handleSubmit = () => {
        if (!value.trim()) return;
        onSend(value);
        setValue("");
    };

    return (
        <div style={{ marginTop: '40px', marginBottom: '0px', width: 'calc(100% - 40px)', height: '500px', borderRadius: '40px', overflow: 'hidden', position: 'relative', margin: '40px auto 0px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CONFIG.FEEDBACK_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
            <div style={{ position: 'relative', zIndex: 2, width: '90%', maxWidth: '500px', textAlign: 'center', color: '#fff', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '20px' }}>Đóng góp ý kiến</h2>
                <div style={{ display: 'flex', gap: '5px', background: 'rgba(255,255,255,0.9)', padding: '6px', borderRadius: '50px' }}>
                    <input 
                        placeholder="Bạn nghĩ gì..." 
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 20px', fontSize: '15px', color: '#000', outline: 'none' }}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <InteractiveButton onClick={handleSubmit} primary={true} style={{ padding: '12px 30px' }} isDarkBg={true} customBlackWhite={true}>Gửi</InteractiveButton>
                </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', gap: '30px' }}>
                <Instagram size={18} color="white" style={{cursor: 'pointer'}}/><Twitter size={18} color="white" style={{cursor: 'pointer'}}/><Facebook size={18} color="white" style={{cursor: 'pointer'}}/><Mail size={18} color="white" style={{cursor: 'pointer'}}/>
            </div>
        </div>
    );
};

const Footer = () => (
    <div style={{ textAlign: 'center', padding: '15px 0 30px 0', backgroundColor: '#fff', color: '#1d1d1f' }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', opacity: 0.8 }}>
            Made by <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '20px', fontWeight: '700' }}>Gia Man</span>
        </p>
    </div>
);

const UploadModal = ({ isOpen, onClose, formData, setFormData, onFileSelect, onRemoveFile, onUpload, uploading }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
           <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                 <h2 style={{ margin: 0, fontSize: '20px', color: '#1d1d1f' }}>Đóng góp tài liệu</h2>
                 <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d1d1f' }}><X size={20}/></button>
             </div>
             {!formData.file ? (
                 <div style={{ border: '2px dashed #ddd', padding: '40px 20px', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                     <input type="file" id="pdf-upload" accept=".pdf" style={{ display: 'none' }} onChange={onFileSelect} />
                     <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                         <UploadCloud size={32} color="#2E7D32" />
                         <div><span style={{ color: '#1d1d1f', fontSize: '16px', fontWeight: '700' }}>Chọn file PDF</span></div>
                     </label>
                 </div>
             ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ background: '#F5F5F7', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText color="#E53935" size={20}/><div style={{ overflow: 'hidden' }}><div style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', color: '#1d1d1f' }}>{formData.file.name}</div></div></div>
                         <button onClick={onRemoveFile} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#FF4D4F"/></button>
                     </div>
                     <input style={Styles.input} placeholder="Tên hiển thị" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                     <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>Chọn khóa:</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['K49', 'K50', 'K51'].map(k => (
                                <button key={k} onClick={() => setFormData({...formData, year: k})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: formData.year === k ? `1px solid ${Styles.colors.primary}` : '1px solid #e0e0e0', background: formData.year === k ? Styles.colors.primary : 'transparent', color: formData.year === k ? '#fff' : '#1d1d1f', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}>{k}</button>
                            ))}
                        </div>
                     </div>
                     <input style={Styles.input} placeholder="Môn (VD: CNTT)" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
                     <input style={Styles.input} placeholder="Ghi chú thêm..." value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} />
                     <InteractiveButton primary={true} onClick={onUpload} disabled={uploading} isDarkBg={false} style={{marginTop: '10px'}}>{uploading ? <Loader className="animate-spin" size={16}/> : "Tải lên ngay"}</InteractiveButton>
                 </div>
             )}
           </div>
        </div>
    );
};

const DocumentGrid = ({ documents, onView }) => (
    <div className="menu-grid">
        {documents.length > 0 ? ( documents.map(item => (<MenuCard key={item.id} item={item} onClick={() => onView(item)} />)) ) : ( <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: '#999' }}>Không tìm thấy tài liệu phù hợp.</div> )}
    </div>
);

// --- 6. MAIN APP ---
export default function App() {
  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', desc: '', year: '', major: '', file: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null); // State cho trình xem tài liệu
  const [isLoading, setIsLoading] = useState(true);

  // --- Lenis Scroll ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js";
    script.async = true;
    script.onload = () => {
      const lenis = new window.Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    document.body.appendChild(script);
  }, []);

  // Init Data & Fake Loading
  useEffect(() => { 
      const savedDocs = localStorage.getItem('hoclieuso_docs');
      if (savedDocs) { setDocuments(JSON.parse(savedDocs)); } else { setDocuments(INITIAL_DOCS); }
      
      // Preload images for better UX
      Object.values(CONFIG.DASHBOARD_IMGS).forEach(src => {
          const img = new Image();
          img.src = src;
      });

      const timer = setTimeout(() => setIsLoading(false), 2000); // Intro load
      return () => clearTimeout(timer);
  }, []);

  // Search Logic
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
          setView(newView);
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
      }, 800);
  };

  const handleUpload = () => {
      if (!formData.file || !formData.title || !formData.year || !formData.major) return alert("Vui lòng nhập đủ thông tin!");
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
          const newDoc = { id: Date.now(), title: formData.title, desc: formData.desc || "Tài liệu sinh viên", year: formData.year, major: formData.major, type: "PDF", fileUrl: e.target.result, cover: Utils.getRandomCover(), createdAt: new Date().toISOString() };
          const updatedDocs = [newDoc, ...documents];
          setDocuments(updatedDocs); localStorage.setItem('hoclieuso_docs', JSON.stringify(updatedDocs));
          setUploading(false); setIsModalOpen(false); setFormData({ title: '', desc: '', year: '', major: '', file: null });
          showToast("Upload thành công!");
      };
      reader.readAsDataURL(formData.file);
  };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && file.type === "application/pdf") setFormData({ ...formData, file: file, title: file.name.replace(/\.pdf$/i, "") });
      else showToast("Chỉ nhận file PDF!");
  };

  const showToast = (message) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <style>{Styles.global}</style>
      <Navbar view={view} setView={setView} setIsModalOpen={setIsModalOpen} onNavigate={handleNavigation} />

      <AnimatePresence>
          {isLoading && <CounterPreloader onComplete={() => setIsLoading(false)} />}
          {toastMessage && <Toast message={toastMessage} />}
          {viewingDoc && <DocViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      </AnimatePresence>

      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <AnimatePresence mode="wait">
            {view === 'home' && (
                <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <HeroSection scrollY={scrollY} />
                    <div style={{ marginTop: '80px' }}>
                        <div style={{ marginBottom: '80px' }}>
                            <ScrollRevealText text="Không gian số hiện đại nơi tài liệu và đề thi được lưu trữ, kết nối và chia sẻ bền vững. Nơi tri thức luôn sẵn sàng đồng hành cùng bạn trên hành trình học tập không giới hạn." />
                        </div>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 1.0, ease: "easeOut" }} style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '800', lineHeight: 1, margin: 0, color: '#1d1d1f' }}>Tài Liệu Mới</motion.h2>
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 1.0, delay: 0.3, ease: "easeOut" }}>
                                <InteractiveButton primary={false} isDarkBg={false} onClick={() => handleNavigation('all')} customBlackWhite={true}>Xem tất cả <ArrowRight size={16}/></InteractiveButton>
                            </motion.div>
                        </div>
                        {/* Truyền hàm xem tài liệu xuống */}
                        <DocumentGrid documents={documents.slice(0, 4)} onView={(doc) => setViewingDoc(doc)} />
                    </div>
                    {/* BỔ SUNG IMPACT DASHBOARD (Bên trên FeedbackSection) */}
                    <ImpactDashboard />
                    
                    <FeedbackSection onSend={() => showToast("Cảm ơn đóng góp của bạn!")} />
                    <Footer />
                </motion.div>
            )}

            {view === 'all' && (
                <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ paddingTop: '100px', minHeight: '100vh', color: '#1d1d1f', position: 'relative', zIndex: 10 }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <TextPressure text="KHO TÀI LIỆU" />
                            <p style={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>Truy cập không giới hạn vào kho tàng tri thức.</p>
                        </div>
                        <SearchSection searchTerm={searchTerm} setSearchTerm={setSearchTerm} suggestions={suggestions} onSelectSuggestion={(doc) => setSearchTerm(doc.title)} />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '60px', flexWrap: 'wrap' }}>
                            {['All', 'K49', 'K50', 'K51'].map(tab => (
                                <InteractiveButton key={tab} primary={activeTab === tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 32px', fontSize: '15px' }} isDarkBg={false}>{tab === 'All' ? 'Tất cả' : `Khóa ${tab}`}</InteractiveButton>
                            ))}
                        </div>
                        {/* Truyền hàm xem tài liệu xuống */}
                        <DocumentGrid documents={getDisplayDocuments()} onView={(doc) => setViewingDoc(doc)} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} formData={formData} setFormData={setFormData} onFileSelect={handleFileSelect} onRemoveFile={() => setFormData({ title: '', desc: '', year: '', major: '', file: null })} onUpload={handleUpload} uploading={uploading} />
    </>
  );
}