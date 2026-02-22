import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Package, Users, ClipboardCheck, FileText, Newspaper, Megaphone, LogOut } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Rooms', path: '/rooms', icon: BedDouble },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Employees', path: '/employees', icon: Users },
        { name: 'Housekeeping', path: '/housekeeping', icon: ClipboardCheck },
        { name: 'Attendance', path: '/attendance', icon: Users },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'News', path: '/news', icon: Newspaper },
        { name: 'Ads', path: '/ads', icon: Megaphone },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-[250px] bg-[#2f3d4a] border-r border-[#1e2936] flex flex-col z-40 overflow-y-auto shadow-md">
            <div className="py-4">
                <nav className="flex flex-col space-y-0.5 mt-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-6 py-3.5 text-sm font-semibold transition-colors ${isActive
                                    ? 'bg-[#ff5b5b] text-white shadow-sm border-l-4 border-[#c0392b] pl-5'
                                    : 'text-[#8c9bab] hover:bg-[#25313d] hover:text-white border-l-4 border-transparent pl-5'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-white' : 'text-[#8c9bab] transition-colors group-hover:text-white'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto px-6 py-4 bg-[#25313d]">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 py-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
