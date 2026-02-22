import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Newspaper } from 'lucide-react';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await api.get('/news');
                setNews(response.data);
            } catch (err) {
                console.error('Error fetching news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <div className="p-4 text-white">Loading News...</div>;

    return (
        <div className="dashboard-content p-6">
            <h1 className="text-2xl font-bold mb-6 text-[#eff6ff]">Village News & Announcements</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.length > 0 ? (
                    news.map((item) => (
                        <div key={item.NewsId} className="card overflow-hidden flex flex-col">
                            {item.ImageUrl && (
                                <img
                                    src={item.ImageUrl}
                                    alt={item.Title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4 flex-1">
                                <h3 className="text-xl font-semibold mb-2 text-white">{item.Title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{item.Content}</p>
                            </div>
                            <div className="p-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-gray-500">
                                <span>{item.CreatedByName}</span>
                                <span>{new Date(item.CreatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full card p-12 text-center text-gray-500">
                        <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No news items available for this lodge.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
