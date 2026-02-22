import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from './authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ username, password }));
        if (loginUser.fulfilled.match(result)) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#020817] to-[#020817]">
            <div className="w-full max-w-md p-10 bg-[#0f172a]/80 backdrop-blur-xl border border-[#334155] rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-500/10 blur-[60px] pointer-events-none"></div>

                <div className="relative">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/20">
                            L
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Sign in to the Lodge Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                            <input
                                type="text"
                                className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 hover:border-[#475569] transition-colors shadow-inner"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                className="w-full bg-[#0f172a] border border-[#334155] text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 hover:border-[#475569] transition-colors shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-lg flex items-center">
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all ${loading
                                ? 'bg-blue-600/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                                }`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
