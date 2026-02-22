import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center z-40 relative mt-auto shadow-sm">
            <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} <span className="text-slate-700 font-semibold">LMS Pro</span>. All rights reserved.
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-slate-400">
                <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
        </footer>
    );
};

export default Footer;
