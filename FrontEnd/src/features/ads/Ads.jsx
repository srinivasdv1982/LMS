import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const Ads = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await api.get('/ads');
                setAds(response.data);
            } catch (err) {
                console.error('Error fetching ads:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    if (loading) return <div className="p-4 text-white">Loading Ads...</div>;

    return (
        <div className="dashboard-content p-6">
            <h1 className="text-2xl font-bold mb-6 text-[#eff6ff]">Village Promotions & Ads</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.length > 0 ? (
                    ads.map((ad) => (
                        <div key={ad.AdId} className="card overflow-hidden hover:border-blue-500 transition-colors group">
                            {ad.ImageUrl && (
                                <div className="relative">
                                    <img
                                        src={ad.ImageUrl}
                                        alt={ad.Title}
                                        className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2 text-white">{ad.Title}</h3>
                                {ad.Link && (
                                    <a
                                        href={ad.Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        Visit Link <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full card p-12 text-center text-gray-500">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No advertisements available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ads;
