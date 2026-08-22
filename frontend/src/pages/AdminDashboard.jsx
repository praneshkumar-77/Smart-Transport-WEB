import { useAuth } from '../context/AuthContext';
import { LogOut, LineChart, Users, CarFront, LayoutDashboard, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import webSocketService from '../services/websocket';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Stats & Live
    const [stats, setStats] = useState({ vehicles: 0, customers: 0, trips: 0 });
    const [liveLocations, setLiveLocations] = useState({});

    // Booking Management
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [vehRes, custRes, tripRes, bookRes, driverRes] = await Promise.all([
                api.get('/vehicles').catch(() => ({ data: { data: [] } })),
                api.get('/customers').catch(() => ({ data: { data: [] } })),
                api.get('/trips').catch(() => ({ data: { data: [] } })),
                api.get('/bookings').catch(() => ({ data: { data: [] } })),
                api.get('/drivers').catch(() => ({ data: { data: [] } }))
            ]);

            setStats({
                vehicles: vehRes.data?.data?.length || 0,
                customers: custRes.data?.data?.length || 0,
                trips: tripRes.data?.data?.length || 0
            });

            // Sort bookings latest first
            const sortedBookings = (bookRes.data?.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sortedBookings);
            setDrivers(driverRes.data?.data || []);

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();

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

    const handleConfirmBooking = async (bookingId, driverId) => {
        if (!driverId) {
            alert("Please select a driver to assign.");
            return;
        }
        try {
            await api.put(`/bookings/${bookingId}/confirm?driverId=${driverId}`);
            alert("Booking confirmed and driver assigned successfully!");
            fetchDashboardData();
        } catch (error) {
            alert("Failed to confirm booking: " + error.message);
        }
    };

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutDashboard color="var(--bg-accent)" />
                    System Admin
                </div>

                <div className="sidebar-nav">
                    <button onClick={() => setActiveTab('overview')} className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 15px' }}>
                        <LineChart size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Overview
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 15px' }}>
                        <CheckCircle size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Booking Requests
                    </button>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'overview' && (
                    <>
                        <h1 className="page-title">Executive Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Live summary of the Smart Transport Management System.</p>

                        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>

                            <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                    <CarFront color="var(--bg-accent)" size={24} />
                                </div>
                                <h2 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '5px' }}>{stats.vehicles}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Vehicles</p>
                            </div>

                            <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                    <Users color="var(--success)" size={24} />
                                </div>
                                <h2 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '5px' }}>{stats.customers}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Registered Customers</p>
                            </div>

                            <div className="glass-panel" style={{ textAlign: 'center', padding: '30px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' }}>
                                    <LayoutDashboard color="var(--error)" size={24} />
                                </div>
                                <h2 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '5px' }}>{stats.trips}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total Trips Logged</p>
                            </div>

                        </div>

                        <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', marginTop: '40px', marginBottom: '20px' }}>Global Live Tracking</h2>
                        <div className="grid-cards">
                            {Object.values(liveLocations).length > 0 ? Object.values(liveLocations).map(loc => (
                                <div key={loc.tripId} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MapPin color="var(--bg-accent)" size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>Trip #{loc.tripId}</h3>
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
                    </>
                )}

                {activeTab === 'bookings' && (
                    <>
                        <h1 className="page-title">Booking Requests</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Review and confirm customer trip requests. Assign drivers to trips.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {bookings.map(booking => (
                                <div key={booking.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>

                                    <div style={{ flex: '1', minWidth: '200px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--bg-accent)', marginBottom: '5px', fontWeight: 'bold' }}>BOOKING ID: #{booking.id}</div>
                                        <h3 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Customer: {booking.customer?.user?.name}</h3>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>Vehicle: {booking.vehicle?.brand} {booking.vehicle?.model}</div>
                                        <div style={{ fontSize: '14px', marginTop: '5px', color: booking.status === 'PENDING' ? 'orange' : booking.status === 'CONFIRMED' ? '#4facfe' : '#ff4b4b' }}>
                                            Status: {booking.status}
                                        </div>
                                    </div>

                                    {booking.trip && (
                                        <div style={{ flex: '2', minWidth: '250px', background: 'var(--bg-main)', padding: '15px', borderRadius: '8px' }}>
                                            <div style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px' }}>
                                                {booking.trip.source} <span style={{ color: 'var(--text-secondary)', margin: '0 5px' }}>→</span> {booking.trip.destination}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '5px' }}><Clock size={14} /> Start: {new Date(booking.trip.startTime).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === 'PENDING' && (
                                        <div style={{ flex: '1', minWidth: '250px' }}>
                                            <select
                                                className="form-input"
                                                style={{ marginBottom: '10px' }}
                                                id={`driver-select-${booking.id}`}
                                            >
                                                <option value="">-- Assign Driver --</option>
                                                {drivers.filter(d => d.availabilityStatus === 'AVAILABLE').map(d => (
                                                    <option key={d.id} value={d.id}>{d.user?.name} (Lic: {d.licenseNumber})</option>
                                                ))}
                                            </select>

                                            <button onClick={() => {
                                                const driverId = document.getElementById(`driver-select-${booking.id}`).value;
                                                handleConfirmBooking(booking.id, driverId);
                                            }} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                                                Confirm & Assign
                                            </button>
                                        </div>
                                    )}

                                    {booking.status === 'CONFIRMED' && booking.trip?.driver && (
                                        <div style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', color: '#00f2fe', fontSize: '14px' }}>
                                            <CheckCircle size={18} /> Assigned to: {booking.trip.driver.user?.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {bookings.length === 0 && <p style={{ color: 'var(--text-primary)' }}>No bookings found.</p>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
