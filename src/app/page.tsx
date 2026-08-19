'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  CheckCircle2, 
  Fuel, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  FileText, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Menu, 
  X, 
  Globe, 
  Activity, 
  Users, 
  Award,
  Sun,
  Moon
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'

// Translation dictionary
const dict = {
  sw: {
    systemName: 'Kibali cha Kuchukua Mafuta',
    officialPortal: 'Jamhuri ya Muungano wa Tanzania',
    navHome: 'Mwanzo',
    navAbout: 'Kuhusu Mfumo',
    navWorkflow: 'Jinsi Unavyofanya Kazi',
    navContact: 'Mawasiliano',
    ctaLogin: 'Ingia',
    ctaLoginFull: 'Ingia kwenye Mfumo',
    ctaLearnMore: 'Jifunze Zaidi',
    heroTagline: 'Mfumo wa vibali vya mafuta wa kidigitali',
    heroTitle: 'Kibali cha Kuchukua Mafuta',
    heroSubtitle: 'Mfumo wa Kidijitali wa Kuomba, Kupitisha na Kusimamai Vibali vya Mafuta kwa Ufanisi na Uwazi.',
    trustBadge1: 'Usalama 100%',
    trustBadge2: 'Tanzania G2G',
    stat1Value: '99.9%',
    stat1Label: 'Upatikanaji wa Mfumo',
    stat2Value: '< 15 Min',
    stat2Label: 'Muda wa Kuidhinisha',
    stat3Value: '10,000+',
    stat3Label: 'Vibali Vilivyotolewa',
    aboutTitle: 'Kuhusu Mfumo',
    aboutSubtitle: 'Ufumbuzi wa Kisasa wa Usimamizi wa Mafuta ya Serikali',
    aboutDesc: 'Mfumo huu umerahisisha mtiririko mzima wa vibali vya mafuta kwa taasisi za umma, ukipunguza matumizi ya karatasi, kuondoa ucheleweshaji na kuongeza udhibiti wa matumizi ya rasilimali.',
    feature1Title: 'Uharaka & Ufanisi',
    feature1Desc: 'Okoa saa nyingi kwa kuwasilisha maombi kidijitali na kupokea idhini ndani ya dakika chache.',
    feature2Title: 'Uwazi na Udhibiti',
    feature2Desc: 'Kila hatua ya kupitisha ina kumbukumbu ya ukaguzi ya kudumu inayozuia matumizi mabaya.',
    feature3Title: 'Usalama Madhubuti',
    feature3Desc: 'Ulinzi wa hali ya juu wa taarifa na ufikiaji unaodhibitiwa kulingana na majukumu ya watumiaji.',
    feature4Title: 'Matumizi Rahisi (PWA)',
    feature4Desc: 'Sakinisha kama programu kwenye simu au kompyuta yako na ufanye kazi popote ulipo hata bila mtandao thabiti.',
    workflowTitle: 'Jinsi Mfumo Unavyofanya Kazi',
    workflowSubtitle: 'Mtiririko Rahisi na Salama wa Hatua Nne',
    step1Title: '1. Wasilisha Ombi',
    step1Desc: 'Mwombaji au Dereva anajaza fomu ya maelezo ya gari na kiwango cha mafuta kinachohitajika kupitia simu au kompyuta.',
    step2Title: '2. Uhakiki wa Idara',
    step2Desc: 'Mkuu wa Idara na Afisa Usafirishaji wanakagua na kuidhinisha ombi baada ya kujiridhisha na uhalali wake.',
    step3Title: '3. Idhini Kuu ya ADA',
    step3Desc: 'Mkurugenzi Msaidizi (ADA) anapokea ombi na kutoa idhini ya mwisho ya kutoa mafuta.',
    step4Title: '4. Ugawaji Mafuta',
    step4Desc: 'Idara ya Ununuzi na Ugavi inatoa mafuta na kufunga ombi kupitia mfumo ikiwa na kumbukumbu kamili.',
    contactTitle: 'Mawasiliano na Msaada',
    contactSubtitle: 'Tuko hapa kukusaidia saa 24/7 kwa maswali au changamoto ya kiufundi',
    address: 'Wizara ya Habari, Mawasiliano na Teknolojia ya Habari, Mji wa Serikali Mtumba, S.L.P 2833, Dodoma, Tanzania.',
    phone: 'Simu: +255 (0) 26 2961800',
    email: 'Barua Pepe: support@mafuta.go.tz',
    copyright: 'Jamhuri ya Muungano wa Tanzania. Haki zote zimehifadhiwa.'
  },
  en: {
    systemName: 'Fuel Permit Management',
    officialPortal: 'United Republic of Tanzania',
    navHome: 'Home',
    navAbout: 'About System',
    navWorkflow: 'How It Works',
    navContact: 'Contact',
    ctaLogin: 'Login',
    ctaLoginFull: 'Login to System',
    ctaLearnMore: 'Learn More',
    heroTagline: 'Digital fuel permit workflow system',
    heroTitle: 'Fuel Permit Management',
    heroSubtitle: 'A digital system for requesting, approving, and managing fuel permits efficiently and transparently.',
    trustBadge1: '100% Secure',
    trustBadge2: 'Tanzania G2G',
    stat1Value: '99.9%',
    stat1Label: 'System Uptime',
    stat2Value: '< 15 Mins',
    stat2Label: 'Approval Time',
    stat3Value: '10,000+',
    stat3Label: 'Permits Issued',
    aboutTitle: 'About System',
    aboutSubtitle: 'Modern Solution for Government Fuel Management',
    aboutDesc: 'This system simplifies the entire fuel permit workflow for public institutions, reducing paper use, eliminating delays, and increasing control over resource utilization.',
    feature1Title: 'Fast & Efficient',
    feature1Desc: 'Save hours by submitting requests digitally and receiving approvals in minutes.',
    feature2Title: 'Transparency & Control',
    feature2Desc: 'Every step has a permanent audit trail preventing misuse and ensuring accountability.',
    feature3Title: 'Robust Security',
    feature3Desc: 'Top-tier information protection and role-based access control for absolute security.',
    feature4Title: 'Easy to Use (PWA)',
    feature4Desc: 'Install it as an app on your phone or desktop and work on the go even under low network conditions.',
    workflowTitle: 'How It Works',
    workflowSubtitle: 'A Simple and Secure Four-Step Process',
    step1Title: '1. Submit Request',
    step1Desc: 'The driver or applicant fills details of vehicle and fuel amount needed from their mobile phone or PC.',
    step2Title: '2. Department Review',
    step2Desc: 'The Head of Department and Transport Officer inspect and endorse the request after validating details.',
    step3Title: '3. ADA Endorsement',
    step3Desc: 'Assistant Director of Administration (ADA) reviews and grants final issuance authority.',
    step4Title: '4. Fuel Issuance',
    step4Desc: 'Procurement and Supplies department issues the fuel and closes the request on the system with full logs.',
    contactTitle: 'Contact & Support',
    contactSubtitle: 'We are here to support you 24/7 for any enquiries or technical difficulties',
    address: 'Ministry of Information, Communication and Information Technology, Government City Mtumba, P.O. Box 2833, Dodoma, Tanzania.',
    phone: 'Phone: +255 (0) 26 2961800',
    email: 'Email: support@mafuta.go.tz',
    copyright: 'United Republic of Tanzania. All Rights Reserved.'
  }
}

export default function HomePage() {
  const { language, toggleLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isSw = language === 'sw'
  const t = isSw ? dict.sw : dict.en

  // Tracking cursor coords for premium 3D mouse parallax tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5 // range: -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5 // range: -0.5 to 0.5
    setMousePos({ x, y })
  }

  return (
    <main className="min-h-screen bg-transparent text-slate-900 transition-colors duration-300 dark:text-slate-100">
      
      {/* Background Ornaments / Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      {/* 1. Header (Sticky & Glassmorphic) */}
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-md py-3 border-slate-200/50 dark:border-slate-800/50' 
            : 'bg-transparent py-5 border-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo / Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-teal-500/30 bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/assets/tanzania-emblem.png"
                alt="Alama ya Taifa la Tanzania"
                fill
                sizes="40px"
                className="object-contain object-center"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 leading-none">
                {t.officialPortal}
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {t.systemName}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-sm font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navHome}
            </Link>
            <Link href="#about" className="text-sm font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navAbout}
            </Link>
            <Link href="#how-it-works" className="text-sm font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navWorkflow}
            </Link>
            <Link href="#contact" className="text-sm font-semibold hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t.navContact}
            </Link>
          </nav>

          {/* Header Actions (Language, Theme, CTA) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title={isSw ? 'Switch to English' : 'Badili kwenda Kiswahili'}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{language}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={theme === 'light' ? 'Njia ya Giza' : 'Njia ya Mwangaza'}
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5 text-slate-700" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-yellow-400" />
              )}
            </button>

            {/* Ingia Button */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 px-5 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg hover:shadow-teal-600/20 dark:hover:shadow-teal-400/10 transition duration-200 hover:-translate-y-0.5"
            >
              {t.ctaLogin}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Switcher on mobile */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-yellow-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-xl px-4 py-6 md:hidden flex flex-col gap-4"
            >
              <Link 
                href="#home" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                {t.navHome}
              </Link>
              <Link 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                {t.navAbout}
              </Link>
              <Link 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                {t.navWorkflow}
              </Link>
              <Link 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-bold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                {t.navContact}
              </Link>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex items-center justify-between px-3">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  <Globe className="h-4 w-4" />
                  <span className="uppercase">{language} ({isSw ? 'Kiswahili' : 'English'})</span>
                </button>
              </div>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-teal-600 font-bold text-white hover:bg-teal-500 transition shadow-md"
              >
                {t.ctaLoginFull}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-8 pb-16 md:py-24 overflow-hidden z-10">
        
        {/* Tanzanian Flag Thin Subtle Ribbon Stripe on top of Hero */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/4 h-full bg-emerald-600" />
          <div className="w-[5%] h-full bg-yellow-400" />
          <div className="w-1/3 h-full bg-black" />
          <div className="w-[5%] h-full bg-yellow-400" />
          <div className="w-1/3 h-full bg-blue-600" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-12 items-center">
          
          {/* Left: Text & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 dark:bg-teal-400/5 px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 backdrop-blur shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.heroTagline}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
              {t.heroTitle}
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              “{t.heroSubtitle}”
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:via-teal-400 hover:to-emerald-500 px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl shadow-teal-600/30 dark:shadow-teal-500/10 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{t.ctaLoginFull}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 px-8 py-4 font-bold text-slate-700 dark:text-slate-200 backdrop-blur transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>{t.ctaLearnMore}</span>
              </Link>
            </div>

            {/* Mini Trust badge stats */}
            <div className="pt-6 grid grid-cols-2 gap-4 max-w-sm sm:max-w-md border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.trustBadge1}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{t.trustBadge2}</span>
              </div>
            </div>

          </motion.div>

          {/* Right: Large 3D Hero Visual (flagtanzania.png) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            
            <div className="relative flex items-center justify-center w-full">
              {/* Soft glow behind flag */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-teal-500/30 via-emerald-500/20 to-blue-500/30 rounded-full blur-3xl opacity-80 dark:opacity-60" />
              
              {/* 3D Visual Card using custom coordinates for dynamic mouse-move parallax */}
              <div className="relative">
                <motion.div
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => {
                    setIsHovered(false)
                    setMousePos({ x: 0, y: 0 })
                  }}
                  className="relative z-10 w-[290px] h-[190px] sm:w-[390px] sm:h-[250px] md:w-[440px] md:h-[280px] rounded-2xl overflow-hidden border border-white/40 dark:border-slate-800/40 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-white/5 backdrop-blur-xl p-2.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                  style={{ 
                    perspective: 1200,
                    transformStyle: 'preserve-3d',
                  }}
                  animate={{
                    // Floating animation when mouse is not hovering
                    y: isHovered ? 0 : [0, -12, 0],
                    rotateX: isHovered ? mousePos.y * -25 : [0, 2, -2, 0],
                    rotateY: isHovered ? mousePos.x * 25 : [0, -4, 4, 0],
                  }}
                  transition={{
                    y: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    rotateX: isHovered ? { type: 'spring', damping: 25, stiffness: 200 } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    rotateY: isHovered ? { type: 'spring', damping: 25, stiffness: 200 } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    default: { type: 'spring', damping: 20 }
                  }}
                >
                  {/* Layer 1: Flag Image */}
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-white/10 dark:border-slate-800/30">
                    <Image
                      src="/assets/flagtanzania.png"
                      alt="Bendera ya Tanzania"
                      fill
                      priority
                      sizes="(max-width: 768px) 290px, 440px"
                      className="object-cover object-center scale-105"
                    />
                    
                    {/* Glass lighting shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-white/35 mix-blend-overlay" />
                  </div>

                  {/* 3D Badge on top of Flag representing official approval */}
                  <motion.div
                    className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 h-14 w-14 sm:h-18 sm:w-18 rounded-full border-2 border-white/50 bg-white/85 p-2 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/85 flex items-center justify-center"
                    style={{ transform: 'translateZ(40px)' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src="/assets/tanzania-emblem.png"
                        alt="Koti la Silaha la Tanzania"
                        fill
                        sizes="50px"
                        className="object-contain"
                      />
                    </div>
                  </motion.div>

                  {/* Glass Card specular highlight line */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-2xl" />
                </motion.div>

                {/* Soft floor shadow that scales with height */}
                <motion.div 
                  className="absolute -bottom-8 left-8 right-8 h-4 bg-slate-900/30 dark:bg-black/60 rounded-full blur-xl z-0 pointer-events-none"
                  animate={{
                    scaleX: isHovered ? 0.95 : [1, 0.9, 1],
                    opacity: isHovered ? 0.55 : [0.6, 0.45, 0.6]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. Below Hero: Statistics Section */}
      <section className="relative py-12 z-10 bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{t.stat1Value}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stat1Label}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{t.stat2Value}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stat2Label}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{t.stat3Value}</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{t.stat3Label}</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. Below Hero: Kuhusu Mfumo / Features */}
      <section id="about" className="py-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
              {t.aboutTitle}
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t.aboutSubtitle}
            </p>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              {t.aboutDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              { title: t.feature1Title, desc: t.feature1Desc, icon: Sparkles, color: 'text-teal-500 bg-teal-500/10' },
              { title: t.feature2Title, desc: t.feature2Desc, icon: FileText, color: 'text-blue-500 bg-blue-500/10' },
              { title: t.feature3Title, desc: t.feature3Desc, icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10' },
              { title: t.feature4Title, desc: t.feature4Desc, icon: Smartphone, color: 'text-indigo-500 bg-indigo-500/10' }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feat.color} mb-5`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}

          </div>

        </div>
      </section>

      {/* 5. Below Hero: Jinsi Mfumo Unavyofanya Kazi (4 Steps) */}
      <section id="how-it-works" className="py-20 relative z-10 bg-slate-100/30 dark:bg-slate-900/20 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
              {t.navWorkflow}
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t.workflowSubtitle}
            </p>
          </div>

          {/* 4 Steps timeline cards */}
          <div className="relative">
            {/* Desktop timeline horizontal connector line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500/40 via-blue-500/40 to-teal-500/40 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { title: t.step1Title, desc: t.step1Desc, stepNum: '1' },
                { title: t.step2Title, desc: t.step2Desc, stepNum: '2' },
                { title: t.step3Title, desc: t.step3Desc, stepNum: '3' },
                { title: t.step4Title, desc: t.step4Desc, stepNum: '4' }
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  className="flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative group hover:border-teal-500 dark:hover:border-teal-500/50 transition-all duration-300"
                >
                  {/* Step counter circle */}
                  <div className="absolute -top-5 left-6 h-10 w-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 group-hover:from-teal-500 group-hover:to-emerald-500 flex items-center justify-center font-black text-white shadow-md shadow-teal-600/20 transition-all duration-300">
                    {step.stepNum}
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 6. Below Hero: Contact Section */}
      <section id="contact" className="py-20 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/65 shadow-xl grid md:grid-cols-2 items-stretch">
            
            {/* Left Column info */}
            <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6">
              <h2 className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                {t.navContact}
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.contactTitle}
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {t.contactSubtitle}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t.address}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t.phone}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column illustration card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 p-8 sm:p-12 flex flex-col justify-between text-white border-l border-slate-200/10">
              {/* Background glowing dots */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(20,184,166,0.15),transparent_40%)]" />
              
              <div className="relative space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                  <Building2 className="h-6 w-6 text-teal-300" />
                </div>
                <h3 className="text-xl font-bold">Wizara ya Habari, Mawasiliano na Teknolojia ya Habari</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Mfumo huu umebuniwa na kusimamiwa na Serikali ya Jamhuri ya Muungano wa Tanzania kupitia Idara ya Teknolojia ya Habari ili kuongeza uwazi na kupunguza upotevu wa mafuta.
                </p>
              </div>

              {/* Tanzanian Emblem as watermarked background visual */}
              <div className="relative h-20 w-20 self-end mt-8 opacity-40">
                <Image
                  src="/assets/tanzania-emblem.png"
                  alt="Tanzania Seal Watermark"
                  fill
                  sizes="80px"
                  className="object-contain filter brightness-110"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Footer (Professional Dark Footer) */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800 z-10 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: System info & Emblem */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white p-1 shadow-inner">
                <Image
                  src="/assets/tanzania-emblem.png"
                  alt="Alama ya Taifa la Tanzania"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <span className="text-base font-black text-white tracking-tight">
                {t.systemName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Mfumo Rasmi wa Serikali kwa Ajili ya Kupitisha, Kuomba na Kusimamia Vibali vya Mafuta vya Magari ya Wizara kwa Njia ya Kielektroniki.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{isSw ? 'Urambazaji' : 'Navigation'}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#home" className="hover:text-teal-400 transition-colors">
                  {t.navHome}
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-teal-400 transition-colors">
                  {t.navAbout}
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-teal-400 transition-colors">
                  {t.navWorkflow}
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-teal-400 transition-colors">
                  {t.navContact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Msaada / Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">{isSw ? 'Msaada' : 'Support'}</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-500" />
                <span>+255 (0) 26 2961800</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-teal-500" />
                <span>support@mafuta.go.tz</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span className="leading-tight">Dodoma, Tanzania</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Vyeti / Badges */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">G2G Portal</h4>
            <div className="flex flex-col gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-teal-400 border border-teal-500/10 w-fit">
                <Award className="h-3.5 w-3.5" />
                <span>e-Government Approved</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-teal-400 border border-teal-500/10 w-fit">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>SSL Encrypted Connection</span>
              </span>
            </div>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t.copyright}</p>
        </div>
      </footer>

    </main>
  )
}
