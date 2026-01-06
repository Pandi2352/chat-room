import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';
import { Smile, MessageSquare, Zap, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.access_token) {
        setAuth(res.data.user, res.data.access_token);
        navigate('/chat');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <div className="h-screen w-full flex bg-emerald-500 overflow-hidden">
      
      {/* Left Side - Brand & Features (Enhanced) */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative">
        
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/10 rounded-full"></div>
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
                <MessageSquare className="w-6 h-6 text-emerald-600" fill="currentColor" />
             </div>
            <span className="text-3xl font-bold text-white tracking-wide">NovaChat</span>
          </div>
          <p className="text-emerald-50 text-base opacity-90 pl-1">Experience the future of communication.</p>
        </div>

        {/* Central Illustration Area */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
            <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500">
                {/* Main Bubble */}
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative z-20 transform rotate-3">
                     <Smile className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-800/80 backdrop-blur-md rounded-2xl flex items-center justify-center animate-bounce shadow-xl border border-white/20">
                     <span className="text-2xl">👋</span>
                </div>
                <div className="absolute -bottom-4 -left-8 w-auto px-4 py-2 bg-emerald-900/90 backdrop-blur-md rounded-lg flex items-center gap-2 animate-pulse shadow-xl border border-white/20">
                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                     <span className="text-white text-xs font-bold">Online</span>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs mt-8">
                 <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-yellow-300" fill="currentColor" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm">Lightning Fast</h4>
                          <p className="text-emerald-100/70 text-xs">Real-time message delivery</p>
                      </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-300" fill="currentColor" />
                      </div>
                      <div>
                          <h4 className="text-white font-bold text-sm">Secure & Private</h4>
                          <p className="text-emerald-100/70 text-xs">End-to-end encryption</p>
                      </div>
                 </div>
            </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-6">
            <div>
                 <p className="text-white font-bold text-lg">10k+</p>
                 <p className="text-emerald-100 text-xs">Active Users</p>
            </div>
            <div className="text-right">
                 <p className="text-white font-bold text-lg">4.9/5</p>
                 <p className="text-emerald-100 text-xs">User Rating</p>
            </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white lg:rounded-l-[50px] shadow-[-20px_0_60px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 lg:p-16 overflow-y-auto relative z-20">
        
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back !</h2>
                <p className="text-gray-500 mt-2">Sign in to continue to NovaChat.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <a href="#" className="text-xs text-gray-500 hover:text-emerald-600">Forgot password?</a>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white font-medium py-3 rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
                >
                    Log In
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Sign in with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    {/* Placeholder for Facebook Icon */}
                    <span className="text-blue-600 font-bold mr-2">f</span> Facebook
                </button>
                <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                     {/* Placeholder for Google Icon */}
                     <span className="text-red-500 font-bold mr-2">G</span> Google
                </button>
            </div>

            <p className="text-center text-gray-600 text-sm mt-8">
                Don't have an account ?{' '}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                    Register
                </Link>
            </p>

            <p className="text-center text-gray-400 text-xs mt-12">
                 &copy; 2026 NovaChat. Crafted with &hearts; by Antigravity
            </p>
        </div>
      </div>
    </div>
  );
}
