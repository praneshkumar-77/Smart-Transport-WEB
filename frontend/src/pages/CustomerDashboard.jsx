import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Key, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api.get('/vehicles');
                setVehicles(res.data.data.filter(v => v.status === 'AVAILABLE'));
            } catch (error) {
                console.error("Failed to fetch vehicles", error);
            }
        };
        fetchVehicles();
    }, []);

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin color="var(--bg-accent)" />
                    Smart Transport
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customer Portal</div>

                <div className="sidebar-nav">
                    <a href="#" className="nav-link active"><Home size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Dashboard</a>
                    <a href="#" className="nav-link"><Key size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> My Bookings</a>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <h1 className="page-title">Welcome back, {user?.name}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Here is your dashboard overview and available vehicles.</p>

                <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '20px' }}>Available Vehicles</h2>

                <div className="grid-cards">
                    {vehicles.length > 0 ? vehicles.map(vehicle => (
                        <div key={vehicle.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
                            <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '10px' }}>{vehicle.brand} {vehicle.model}</h3>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px', flex: '1' }}>
                                <p>Type: {vehicle.vehicleType}</p>
                                <p>Capacity: {vehicle.capacity} Seats</p>
                                <p>Reg: <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{vehicle.registrationNumber}</span></p>
                            </div>
                            <button className="btn-primary" style={{ padding: '8px' }}>Book Now</button>
                        </div>
                    )) : (
                        <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No vehicles currently available for booking.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
