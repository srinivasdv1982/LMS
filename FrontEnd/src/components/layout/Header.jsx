import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { Search, LayoutDashboard, BedDouble, Package, Users, ClipboardCheck, FileText, Newspaper, Megaphone } from 'lucide-react';

const ALL_PAGES = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, keywords: 'home overview kpi' },
    { name: 'Rooms', path: '/rooms', icon: BedDouble, keywords: 'room booking availability' },
    { name: 'Inventory', path: '/inventory', icon: Package, keywords: 'stock items transactions' },
    { name: 'Employees', path: '/employees', icon: Users, keywords: 'staff workers' },
    { name: 'Housekeeping', path: '/housekeeping', icon: ClipboardCheck, keywords: 'cleaning tasks rooms' },
    { name: 'Attendance', path: '/attendance', icon: Users, keywords: 'present absent leave mark' },
    { name: 'Reports', path: '/reports', icon: FileText, keywords: 'analytics summary lodge' },
    { name: 'News', path: '/news', icon: Newspaper, keywords: 'announcements updates' },
    { name: 'Ads', path: '/ads', icon: Megaphone, keywords: 'advertisements promotions' },
];

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token, user } = useSelector((state) => state.auth);

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    const results = query.trim().length > 0
        ? ALL_PAGES.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.keywords.toLowerCase().includes(query.toLowerCase())
        )
        : ALL_PAGES;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (path) => {
        navigate(path);
        setQuery('');
        setIsOpen(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#2f3d4a] border-b border-[#1e2936] z-50 flex items-center justify-between px-6 shadow-md">
            <div className="flex items-center gap-3">
                {/* Logo Space */}
                <h1 className="text-xl font-bold text-white tracking-widest uppercase">
                    LMS <span className="text-orange-400 font-normal">- {user?.lodgeName || 'HOTELS'}</span>
                </h1>
            </div>

            {token && (
                <>
                    {/* Global Search */}
                    <div ref={searchRef} className="relative w-full max-w-sm mx-8">
                        <div className="flex items-center bg-[#25313d] border border-[#455a64] rounded-lg px-3 py-2 gap-2 focus-within:border-orange-400 transition-colors">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search pages... (e.g. Inventory)"
                                value={query}
                                onFocus={() => setIsOpen(true)}
                                onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                                className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
                            />
                            {query && (
                                <button onClick={() => { setQuery(''); setIsOpen(false); }} className="text-slate-500 hover:text-slate-300 text-xs">
                                    ✕
                                </button>
                            )}
                        </div>

                        {isOpen && (
                            <div className="absolute top-full mt-1 left-0 right-0 bg-[#25313d] border border-[#455a64] rounded-lg shadow-2xl overflow-hidden z-[9999]">
                                {results.length === 0 ? (
                                    <p className="text-slate-500 text-sm px-4 py-3">No pages found.</p>
                                ) : (
                                    results.map((page) => {
                                        const Icon = page.icon;
                                        return (
                                            <button
                                                key={page.path}
                                                onClick={() => handleSelect(page.path)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#ff5b5b]/20 transition-colors group"
                                            >
                                                <Icon size={16} className="text-slate-400 group-hover:text-orange-400 shrink-0" />
                                                <span className="text-sm text-slate-200 group-hover:text-white font-medium">{page.name}</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-r border-[#455a64] pr-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-white">{user?.username || user?.name || 'ADMIN'}</p>
                                <p className="text-xs text-slate-400">ID: {user?.lodgeId || '1'}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#1e2936] flex items-center justify-center text-white font-bold">
                                {(user?.username || user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch(logout())}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors bg-transparent hover:bg-[#1e2936] px-4 py-2 rounded"
                        >
                            ADMIN ▼
                        </button>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
