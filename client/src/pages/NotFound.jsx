import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 px-8 md:px-16 lg:px-24 flex flex-col bg-v-cyan bg-pinstripe justify-center items-center relative overflow-hidden">
      
      {/* Abstract geometric elements */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-[15%] w-8 h-8 bg-v-dark opacity-20"></div>
        <div className="absolute top-48 left-[8%] w-6 h-6 bg-v-dark opacity-20"></div>
        <div className="absolute top-[28%] left-[10%] w-10 h-10 bg-v-dark opacity-20"></div>
        <div className="absolute bottom-[20%] right-[15%] w-12 h-12 bg-v-dark opacity-20"></div>
        <div className="absolute bottom-[30%] right-[8%] w-8 h-8 bg-v-dark opacity-20"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl bg-white p-12 shadow-sm">
        <h1 className="text-8xl font-bold tracking-tighter text-v-dark mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6 text-v-dark">Page Not Found</h2>
        <p className="text-sm font-medium text-v-dark/80 mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved. Please verify the URL or return to the Research Workspace to start a new company research request.
        </p>
        
        <Link to="/" className="inline-flex items-center justify-center space-x-2 bg-v-dark text-white px-8 py-4 rounded hover:bg-black transition-colors text-sm font-medium">
          <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          <span>RETURN TO HOME</span>
        </Link>
      </div>
      
    </div>
  );
};

export default NotFound;
