import React, { useState, useRef } from 'react';
import { Send, Sparkles, Code2, Zap, LayoutTemplate, ArrowRight, Github, CheckCircle2, BarChart3, Users, Settings } from 'lucide-react';
import { useStore } from '../store';
import { generateComponentCode } from '../services/api';
import { useWebContainer } from '../hooks/useWebContainer';
import toast from 'react-hot-toast';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Landing() {
  const [inputValue, setInputValue] = useState('');
  const {
    setCurrentView, setPrompt, setLoadingStep, setGeneratedCode,
    addHistory, setActiveTab, setJobProgress, setIframeUrl, userId
  } = useStore();
  const { bootAndMount } = useWebContainer();
  const textareaRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;

    // Switch to canvas view to show loading state
    setCurrentView('canvas');
    setPrompt(userMessage);
    setIframeUrl(null); // Clear old preview
    setJobProgress(0);
    addHistory({ type: 'user', content: userMessage, timestamp: Date.now() });

    try {
      setLoadingStep('enhancing');

      // Call the backend — it handles the full pipeline internally
      // (prompt enhancement → code generation → debugging → validation)
      const result = await generateComponentCode(userMessage, userId, {
        onProgress: (progress, step) => {
          setJobProgress(progress);
          setLoadingStep(step);
        }
      });

      const code = typeof result === 'string' ? result : result.code;
      setGeneratedCode(code);

      // Boot WebContainer with the generated code
      await bootAndMount(code);
      addHistory({
        type: 'ai',
        content: "I've generated the UI component for you. You can preview it on the right or view the source code.",
        timestamp: Date.now()
      });
      setActiveTab('preview');
      toast.success('Component generated successfully!');
    } catch (err) {
      toast.error('Generation failed: ' + err.message);
      setLoadingStep('idle');
      setJobProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const features = [
    {
      icon: <LayoutTemplate className="w-6 h-6 text-brand-pink" />,
      title: "Instantly Production-Ready",
      description: "Get clean, modern React code stylized with TailwindCSS out of the box."
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-pink" />,
      title: "Lightning Fast Engine",
      description: "Powered by WebContainers. Compile, preview, and build in milliseconds directly in your browser."
    },
    {
      icon: <Code2 className="w-6 h-6 text-brand-pink" />,
      title: "Intelligent Copilot",
      description: "Neura AI Data Engine understands deep context to iterate upon your layouts."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full z-50">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-brand-pink w-5 h-5 flex-shrink-0" />
          <span className="font-bold text-xl tracking-tight text-white">Neura</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200">Features</a>
          <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200">Pricing</a>
          <button
            onClick={() => document.getElementById('hero-input').focus()}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 active:scale-95 transition-all"
          >
            Start building
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        style={{ opacity, scale }}
        className="relative flex flex-col items-center justify-center pt-24 pb-32 px-4 z-10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-pink/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-4xl"
        >
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-pink animate-pulse"></span>
            <span className="text-sm font-medium text-gray-300">Neura v2.0 is now live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
            Build interfaces at the speed of <span> </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-purple-400">
              thought.
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12">
            Describe the UI you want to build and watch as Neura crafts it instantly into production-ready code. No setup, no boilerplate. Just pure creativity.
          </p>

          <motion.form
            layoutId="chatbot-input"
            onSubmit={handleGenerate}
            className="w-full max-w-3xl relative"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-pink/30 via-purple-500/30 to-brand-pink/30 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#111111]/80 backdrop-blur-xl border border-[#1F1F22] rounded-3xl p-4 shadow-2xl focus-within:border-brand-pink/50 focus-within:bg-[#151515] transition-all duration-300 flex flex-col">
              <textarea
                id="hero-input"
                ref={textareaRef}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Build me a modern dashboard with a sidebar..."
                className="w-full bg-transparent border-none outline-none resize-none text-[18px] p-4 text-gray-200 placeholder-gray-600 max-h-[300px] min-h-[100px]"
                rows="1"
              />
              <div className="flex items-center justify-between mt-2 px-2 pb-2">
                <span className="text-xs text-gray-500 ml-2 uppercase tracking-wider font-semibold">Press Enter to spark</span>
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`px-6 py-2.5 rounded-2xl flex items-center justify-center space-x-2 font-medium transition-all duration-300 ${!inputValue.trim() ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                >
                  <span>Generate UI</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </motion.form>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {['A sleek SaaS pricing page', 'A dark-mode analytics dashboard', 'A mobile-first e-commerce cart'].map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setInputValue(suggestion);
                }}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-gray-300 text-sm hover:text-white hover:border-brand-pink/40 hover:bg-white/10 transition-all font-medium"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Social Proof */}
      <section className="border-y border-[#1F1F22] py-8 bg-[#050505] relative z-20 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
        <div className="flex items-center justify-center mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500">Trusted by innovative teams worldwide</p>
        </div>
        <div className="flex space-x-16 items-center justify-center opacity-40 mix-blend-luminosity">
          {['Acme Corp', 'NeoFin', 'Strata', 'Quantum', 'Aura'].map((logo, i) => (
            <span key={i} className="text-xl font-bold font-serif whitespace-nowrap">{logo}</span>
          ))}
        </div>
      </section>

      {/* Interactive Demo Showcase */}
      <section className="py-24 px-6 relative z-20 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-[#1F1F22] bg-[#0A0A0A] overflow-hidden shadow-[0_0_80px_rgba(224,24,90,0.08)] hidden md:block"
          >
            {/* Browser Header */}
            <div className="bg-[#111] border-b border-[#1F1F22] px-4 py-3 flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto bg-[#1A1A1A] rounded-md px-32 py-1 text-xs text-gray-500 flex items-center">
                <Sparkles className="w-3 h-3 mr-2 text-brand-pink" /> neura-app.dev
              </div>
            </div>
            {/* App Body Mockup */}
            <div className="grid grid-cols-12 h-[560px]">
              {/* Sidebar Mockup */}
              <div className="col-span-3 border-r border-[#1F1F22] bg-[#0C0C0C] p-6">
                <div className="h-8 w-10 bg-brand-pink rounded mb-8 shadow-[0_0_15px_rgba(224,24,90,0.5)]"></div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <BarChart3 className="w-5 h-5" /> <div className="h-4 w-20 bg-white/10 rounded"></div>
                  </div>
                  <div className="flex items-center space-x-3 text-brand-pink bg-brand-pink/10 p-2 -mx-2 rounded-lg">
                    <Users className="w-5 h-5" /> <div className="h-4 w-24 bg-brand-pink/30 rounded"></div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Settings className="w-5 h-5" /> <div className="h-4 w-16 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
              {/* Main Content Mockup */}
              <div className="col-span-9 bg-[#050505] p-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/10 via-transparent to-transparent"></div>
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <div>
                    <div className="h-8 w-48 bg-white/10 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-white/5 rounded"></div>
                  </div>
                  <div className="h-10 w-32 bg-brand-pink rounded-full opacity-90 text-white flex items-center justify-center text-xs font-semibold shadow-[0_0_20px_rgba(224,24,90,0.3)]">Invite Users</div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
                  <div className="h-32 bg-[#111]/80 backdrop-blur-sm rounded-2xl border border-[#1F1F22] p-5">
                    <div className="h-4 w-24 bg-white/10 rounded mb-6"></div>
                    <div className="h-10 w-20 bg-white/20 rounded"></div>
                  </div>
                  <div className="h-32 bg-[#111]/80 backdrop-blur-sm rounded-2xl border border-[#1F1F22] p-5">
                    <div className="h-4 w-24 bg-white/10 rounded mb-6"></div>
                    <div className="h-10 w-16 bg-white/20 rounded"></div>
                  </div>
                  <div className="h-32 bg-[#111]/80 backdrop-blur-sm rounded-2xl border border-[#1F1F22] p-5 flex items-end">
                    <div className="w-full flex items-end space-x-2 h-16">
                      <div className="w-1/4 bg-brand-pink/40 rounded-t h-[40%]"></div>
                      <div className="w-1/4 bg-brand-pink/60 rounded-t h-[70%]"></div>
                      <div className="w-1/4 bg-brand-pink/80 rounded-t h-[50%]"></div>
                      <div className="w-1/4 bg-brand-pink rounded-t h-[90%]"></div>
                    </div>
                  </div>
                </div>
                <div className="h-48 bg-[#111]/80 backdrop-blur-sm rounded-2xl border border-[#1F1F22] relative z-10"></div>

                {/* Floating Code generation box */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-12 right-12 bg-black/90 backdrop-blur-2xl border border-brand-pink/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(224,24,90,0.3)] w-80 z-20"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="animate-spin text-brand-pink"><Sparkles className="w-4 h-4" /></div>
                    <span className="text-sm font-semibold text-white">Generating Dashboard...</span>
                  </div>
                  <div className="space-y-2.5 opacity-60">
                    <div className="h-2 w-[90%] bg-blue-400 rounded"></div>
                    <div className="h-2 w-[70%] bg-blue-400 rounded"></div>
                    <div className="h-2 w-[40%] bg-pink-400 rounded"></div>
                    <div className="h-2 w-[85%] bg-white rounded"></div>
                    <div className="h-2 w-[60%] bg-white rounded"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6 relative z-20 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for modern workflows</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Stop wasting time on setup and tweaking divs. Let Neura handle the groundwork so you can focus on the user experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={feature.title}
                className="bg-[#0A0A0A] border border-[#1F1F22] rounded-3xl p-8 hover:border-brand-pink/30 hover:shadow-[0_0_30px_rgba(224,24,90,0.05)] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#151515] rounded-2xl border border-[#222] flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative z-20 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg">Start building for free, upgrade when you need superpowers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-[#0A0A0A] border border-[#1F1F22] rounded-3xl p-10 flex flex-col hover:border-[#333] transition-colors">
              <h3 className="text-2xl font-bold mb-2">Hobby</h3>
              <p className="text-gray-400 mb-6">Perfect for side projects and prototypes.</p>
              <div className="text-6xl font-extrabold mb-8 tracking-tighter">$0<span className="text-lg text-gray-500 font-medium tracking-normal">/mo</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                {['100 generations per month', 'Community support', 'Basic React components', 'Source code export'].map(f => (
                  <li key={f} className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-500 mr-3" />{f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl border border-[#1F1F22] bg-white/5 hover:bg-white/10 transition-colors font-semibold">Start for free</button>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-brand-pink/40 rounded-3xl p-10 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(224,24,90,0.15)] transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-pink to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">POPULAR</div>
              <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
              <p className="text-brand-pink mb-6">For professional developers and teams.</p>
              <div className="text-6xl font-extrabold mb-8 tracking-tighter text-white">$20<span className="text-lg text-gray-400 font-medium tracking-normal">/mo</span></div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Unlimited generations', 'Priority premium support', 'Advanced interactive components', 'Figma to Code', 'Private workspaces'].map(f => (
                  <li key={f} className="flex items-center text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-brand-pink mr-3" />{f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 rounded-xl bg-brand-pink text-white hover:bg-[#c0124c] transition-colors font-semibold shadow-[0_0_20px_rgba(224,24,90,0.4)] hover:shadow-[0_0_30px_rgba(224,24,90,0.6)] hover:scale-[1.02] active:scale-95 duration-200">Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-20 overflow-hidden">
        <div className="absolute inset-0 bg-brand-pink/5"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to step into the future?</h2>
          <button
            onClick={() => document.getElementById('hero-input').focus()}
            className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Start building for free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F22] py-12 px-6 bg-[#050505] relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="text-brand-pink w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-lg tracking-tight text-white">Neura AI</span>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Neura Labs Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
