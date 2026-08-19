import { useAuth } from '../context/AuthContext';
import { LogOut, Navigation, Map, Car, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import webSocketService from '../services/websocket';

const DriverDashboard = () => {
    const { user, logout } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const locationIntervalRef = useRef(null);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                // In a full app, we'd fetch driver-specific trips. For now we fetch all and filter, or backend does it.
                // Assuming we fetch all trips and filter for this driver (requires backend tweak or driver-specific endpoint later)
                const res = await api.get('/trips');
                setTrips(res.data.data.filter(t => t.driver.user.id === user.id));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch trips", error);
                setLoading(false);
            }
        };
        fetchTrips();

        webSocketService.connect(() => console.log("BroadCasting Service Connected"));
        return () => {
            if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
            webSocketService.disconnect();
        };
    }, [user.id]);

    useEffect(() => {
        const activeTrip = trips.find(t => t.status === 'STARTED');
        if (activeTrip) {
            if (!locationIntervalRef.current) {
                // mock coords
                let lat = 40.7128;
                let lng = -74.0060;
                locationIntervalRef.current = setInterval(() => {
                    lat += (Math.random() - 0.5) * 0.001;
                    lng += (Math.random() - 0.5) * 0.001;
                    webSocketService.sendLocation(activeTrip.id, lat, lng);
                }, 3000);
            }
        } else {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
        }
    }, [trips]);

    const updateTripStatus = async (tripId, status) => {
        try {
            await api.put(`/trips/${tripId}/status?status=${status}`);
            setTrips(trips.map(t => t.id === tripId ? { ...t, status } : t));
        } catch (error) {
            alert("Error updating status: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Navigation color="var(--bg-accent)" />
                    Smart Transport
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Driver Portal</div>

                <div className="sidebar-nav">
                    <a href="#" className="nav-link active"><Map size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> My Trips</a>
                    <a href="#" className="nav-link"><Car size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Vehicle Details</a>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <h1 className="page-title">Welcome on duty, {user?.name}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Manage your assigned trips and update statuses in real-time.</p>

                <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '20px' }}>Your Assigned Trips</h2>

                <div className="grid-cards">
                    {loading ? (
                        <div style={{ color: 'var(--text-secondary)' }}>Loading trips...</div>
                    ) : trips.length > 0 ? trips.map(trip => (
                        <div key={trip.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3 style={{ fontSize: '16px', color: 'white' }}>Trip #{trip.id}</h3>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: trip.status === 'COMPLETED' ? 'var(--success)' : 'var(--bg-accent)' }}>
                                    {trip.status}
                                </span>
                            </div>

                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', flex: '1' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                    <MapPin size={16} color="var(--error)" /> <span><strong>From:</strong> {trip.source}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                    <MapPin size={16} color="var(--success)" /> <span><strong>To:</strong> {trip.destination}</span>
                                </div>
                                <p style={{ marginTop: '10px' }}><strong>Expected:</strong> {new Date(trip.expectedArrival).toLocaleString()}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {trip.status === 'SCHEDULED' && (
                                    <button onClick={() => updateTripStatus(trip.id, 'STARTED')} className="btn-primary" style={{ background: 'var(--success)' }}>Start Trip</button>
                                )}
                                {trip.status === 'STARTED' && (
                                    <button onClick={() => updateTripStatus(trip.id, 'COMPLETED')} className="btn-primary">Complete Trip</button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            You currently have no assigned trips.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
