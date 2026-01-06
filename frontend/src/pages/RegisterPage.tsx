import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { UserPlus, MessageSquare } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/register', {
        email,
        password,
        displayName,
      });
      if (res.data.access_token) {
        setAuth(res.data.user, res.data.access_token);
        navigate('/chat');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="h-screen w-full flex bg-emerald-500 overflow-hidden">
      
      {/* Left Side - Brand & Features (Enhanced) */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative">
        
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full"></div>
        </div>

         {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <MessageSquare className="w-6 h-6 text-emerald-600" fill="currentColor" />
             </div>
            <span className="text-3xl font-bold text-white tracking-wide">NovaChat</span>
          </div>
          <p className="text-emerald-50 text-base opacity-90 pl-1">Join the community today.</p>
        </div>

        {/* Central Illustration Area */}
         <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            {/* Connection Metaphor */}
            <div className="relative mb-12 w-full max-w-xs h-40">
                 {/* Center Hub */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl z-20">
                      <UserPlus className="w-10 h-10 text-emerald-600" />
                 </div>
                 
                 {/* Orbiting Users */}
                 <div className="absolute top-0 left-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-bounce">
                     <span className="text-xl">👩‍💻</span>
                 </div>
                 <div className="absolute top-4 right-8 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '0.5s'}}>
                     <span className="text-2xl">🌍</span>
                 </div>
                 <div className="absolute bottom-0 right-16 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '1s'}}>
                     <span className="text-lg">🎨</span>
                 </div>
                 <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse" style={{animationDelay: '1.5s'}}>
                     <span className="text-xl">🚀</span>
                 </div>
            </div>

             {/* Value Prop */}
             <div className="text-center space-y-2 max-w-xs">
                 <h3 className="text-2xl font-bold text-white">Connect Instantly</h3>
                 <p className="text-emerald-100 text-sm leading-relaxed">
                     Create groups, share files, and stay in touch with friends and colleagues around the globe.
                 </p>
             </div>
        </div>

         {/* Footer info */}
        <div className="relative z-10 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
                 <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-gray-200"></div>
                     ))}
                 </div>
                 <p className="text-emerald-100 text-xs font-medium">Joined by 200+ people today</p>
            </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 bg-white lg:rounded-l-[50px] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 lg:p-16 overflow-y-auto relative z-20">
        
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Register Account</h2>
                <p className="text-gray-500 mt-2">Get your free NovaChat account now.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DisplayName</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter email"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter password"
                        required
                    />
                </div>

                <div className="text-xs text-gray-500">
                    By registering you agree to the NovaChat <a href="#" className="text-emerald-600 hover:underline">Terms of Use</a>
                </div>

                <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white font-medium py-3 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
                >
                    Register
                </button>
            </form>

             <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Sign up using</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    <span className="text-blue-600 font-bold mr-2">f</span> Facebook
                </button>
                <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                     <span className="text-red-500 font-bold mr-2">G</span> Google
                </button>
            </div>


            <p className="text-center text-gray-600 text-sm mt-8">
                Already have an account ?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                    Login
                </Link>
            </p>

             <p className="text-center text-gray-400 text-xs mt-8">
                 &copy; 2026 NovaChat. Crafted with &hearts; by Antigravity
            </p>
        </div>
      </div>
    </div>
  );
}
