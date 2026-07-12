import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white py-24 px-8 md:px-16 lg:px-24 w-full relative overflow-hidden">
      {/* Decorative background shape elements to support the signature styling */}
      <div className="absolute w-10 h-10 bg-[#2a2a2a] top-[15%] left-[8%] pointer-events-none"></div>
      <div className="absolute w-8 h-8 bg-[#2a2a2a] top-[45%] left-[22%] pointer-events-none"></div>
      <div className="absolute w-12 h-12 bg-[#262626] bottom-[25%] left-[12%] pointer-events-none"></div>
      <div className="absolute w-14 h-14 bg-[#2a2a2a] top-[20%] right-[35%] pointer-events-none"></div>
      <div className="absolute w-8 h-8 bg-[#262626] bottom-[30%] right-[18%] pointer-events-none"></div>
      <div className="absolute w-10 h-10 bg-[#2a2a2a] bottom-[15%] right-[42%] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16 relative z-10">
        <div className="max-w-md">
          <h3 className="text-sm tracking-widest font-bold mb-4 uppercase">AI INVESTMENT RESEARCH AGENT</h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            Building robust, evidence-driven AI workflows with LangGraph for transparent investment research.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end w-full md:w-auto">
          <a
            href="mailto:info@evidenceai.com"
            className="text-4xl md:text-6xl lg:text-[76px] font-medium tracking-tight text-white hover:text-[#a5f3fc] transition-colors pb-4 border-b-2 border-white w-full text-left md:text-right"
          >
            INFO@EVIDENCEAI.COM
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-xs font-medium text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <p>&copy; {new Date().getFullYear()} AI Investment Research Agent Project. All rights reserved.</p>
        <div className="flex items-center gap-6 text-gray-400">
          <Link to="/about" className="hover:text-white transition-colors">Architecture</Link>
          <Link to="/services" className="hover:text-white transition-colors">Capabilities</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

