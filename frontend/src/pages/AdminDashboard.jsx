import { useAuth } from '../context/AuthContext';
import { LogOut, LineChart, Users, CarFront, LayoutDashboard, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import webSocketService from '../services/websocket';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState({ vehicles: 0, customers: 0, trips: 0 });
    const [liveLocations, setLiveLocations] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In parallel, fetch absolute numbers to demonstrate an admin overview
                const [vehRes, custRes, tripRes] = await Promise.all([
                    api.get('/vehicles').catch(() => ({ data: { data: [] } })),
                    api.get('/customers').catch(() => ({ data: { data: [] } })),
                    api.get('/trips').catch(() => ({ data: { data: [] } }))
                ]);

                setStats({
                    vehicles: vehRes.data?.data?.length || 0,
                    customers: custRes.data?.data?.length || 0,
                    trips: tripRes.data?.data?.length || 0
                });
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };
        fetchStats();

        webSocketService.connect(() => {
            console.log("Admin subscribed to locations");
            webSocketService.subscribeToLocation((data) => {
                setLiveLocations(prev => ({
                    ...prev,
                    [data.tripId]: data
                }));
            });
        });

        return () => webSocketService.disconnect();
    }, []);

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutDashboard color="var(--bg-accent)" />
                    System Admin
                </div>

                <div className="sidebar-nav">
                    <a href="#" className="nav-link active"><LineChart size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Overview</a>
                    <a href="#" className="nav-link"><CarFront size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Manage Vehicles</a>
                    <a href="#" className="nav-link"><Users size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Manage Users</a>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <h1 className="page-title">Executive Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Live summary of the Smart Transport Management System.</p>

                <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                            <CarFront color="var(--bg-accent)" size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', color: 'white', marginBottom: '5px' }}>{stats.vehicles}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Vehicles</p>
                    </div>

                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                            <Users color="var(--success)" size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', color: 'white', marginBottom: '5px' }}>{stats.customers}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Registered Customers</p>
                    </div>

                    <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                            <LayoutDashboard color="var(--error)" size={24} />
                        </div>
                        <h2 style={{ fontSize: '32px', color: 'white', marginBottom: '5px' }}>{stats.trips}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Trips Logged</p>
                    </div>

                </div>

                <h2 style={{ fontSize: '18px', color: 'white', marginTop: '40px', marginBottom: '20px' }}>Global Live Tracking</h2>
                <div className="grid-cards">
                    {Object.values(liveLocations).length > 0 ? Object.values(liveLocations).map(loc => (
                        <div key={loc.tripId} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin color="var(--bg-accent)" size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', color: 'white', marginBottom: '4px' }}>Trip #{loc.tripId}</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                    Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No live trips currently tracking.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
