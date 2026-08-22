import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Key, MapPin, Calendar, Clock, Crosshair, Navigation, CheckCircle, Search, Map } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customerProfile, setCustomerProfile] = useState(null);
    const [bookingForm, setBookingForm] = useState(null); // active vehicle id
    const [formData, setFormData] = useState({
        source: '',
        destination: '',
        startTime: '',
        expectedArrival: ''
    });
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Route Explorer State
    const [route, setRoute] = useState({ source: '', destination: '' });
    const [routeResult, setRouteResult] = useState(null);

    useEffect(() => {
        const initializeDashboard = async () => {
            try {
                const custRes = await api.get('/customers');
                const existing = custRes.data.data.find(c => c.user?.id === user?.id);
                if (existing) {
                    setCustomerProfile(existing);
                } else {
                    const newCust = await api.post('/customers', {
                        userId: user.id,
                        address: 'Default Address'
                    });
                    setCustomerProfile(newCust.data.data);
                }

                const vehRes = await api.get('/vehicles');
                setVehicles(vehRes.data.data.filter(v => v.status === 'AVAILABLE'));
            } catch (error) {
                console.error("Initialization error", error);
            }
        };
        if (user && user.id) {
            initializeDashboard();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            const myBookings = res.data.data.filter(b => b.customer?.user?.id === user?.id);
            myBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(myBookings);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        }
    }, [activeTab]);

    const handleGetLocation = (isExplorer = false) => {
        setLoadingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const locStr = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                if (isExplorer) {
                    setRoute(prev => ({ ...prev, source: locStr }));
                } else {
                    setFormData(prev => ({ ...prev, source: locStr }));
                }
                setLoadingLocation(false);
            }, () => {
                alert("Failed to get location.");
                setLoadingLocation(false);
            });
        }
    };

    const handleBookVehicle = async (e, vehicleId) => {
        e.preventDefault();
        try {
            await api.post('/bookings', {
                customerId: customerProfile.id,
                vehicleId: vehicleId,
                source: formData.source,
                destination: formData.destination,
                startTime: formData.startTime,
                expectedArrival: formData.expectedArrival
            });
            alert('Booking submitted successfully! Waiting for admin confirmation.');
            setBookingForm(null);
            setActiveTab('bookings');
        } catch (error) {
            alert('Booking failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const calculateDistance = async (e) => {
        e.preventDefault();
        if (!route.source || !route.destination) return;

        setRouteResult({ loading: true, distance: '...', time: '...' });

        try {
            // 1. Geocode Source (Prioritize India for accuracy as requested)
            const getCoords = async (place) => {
                const query = encodeURIComponent(place + ', India');
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                const data = await res.json();
                return (data && data.length > 0) ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
            };

            const srcCoords = await getCoords(route.source);
            const destCoords = await getCoords(route.destination);

            if (!srcCoords || !destCoords) {
                alert("Could not accurately locate one or both of the locations. Please try adding more details (e.g., 'Bengaluru, Karnataka').");
                setRouteResult(null);
                return;
            }

            // 2. Routing via OSRM (Open Source Routing Machine)
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${srcCoords.lon},${srcCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
            const routeRes = await fetch(osrmUrl);
            const routeData = await routeRes.json();

            if (routeData && routeData.routes && routeData.routes.length > 0) {
                const distMeter = routeData.routes[0].distance;
                const durationSec = routeData.routes[0].duration;

                const distanceKm = Math.round(distMeter / 1000);
                const timeMins = Math.round(durationSec / 60);

                const hours = Math.floor(timeMins / 60);
                const mins = timeMins % 60;

                setRouteResult({
                    distance: distanceKm,
                    time: `${hours > 0 ? hours + ' hr ' : ''}${mins} min`
                });
            } else {
                throw new Error("No driving route found between these locations.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to calculate real distance. Please ensure you have internet access and try again.");
            setRouteResult(null);
        }
    };

    return (
        <div className="dashboard-container fade-in">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin color="var(--bg-accent)" />
                    Smart Transport
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Customer Portal</div>

                <div className="sidebar-nav">
                    <button onClick={() => setActiveTab('dashboard')} className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 15px' }}>
                        <Home size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('explorer')} className={`nav-link ${activeTab === 'explorer' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 15px' }}>
                        <Search size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> Route Explorer
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 15px' }}>
                        <Key size={18} style={{ display: 'inline', marginRight: '10px', verticalAlign: '-3px' }} /> My Bookings
                    </button>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={logout} className="btn-primary" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'dashboard' && (
                    <>
                        <h1 className="page-title">Welcome, {user?.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Select an available vehicle to plan your trip.</p>

                        <div className="grid-cards">
                            {vehicles.length > 0 ? vehicles.map(vehicle => (
                                <div key={vehicle.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>{vehicle.brand} {vehicle.model}</h3>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '15px', flex: '1' }}>
                                        <p>Type: {vehicle.vehicleType}</p>
                                        <p>Capacity: {vehicle.capacity} Seats</p>
                                        <p>Reg: <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', width: 'auto', flex: 'none', display: 'flex', alignItems: 'center', padding: '2px 6px', borderRadius: '4px' }}>{vehicle.registrationNumber}</span></p>
                                    </div>

                                    {bookingForm === vehicle.id ? (
                                        <form onSubmit={(e) => handleBookVehicle(e, vehicle.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <input required type="text" placeholder="Source Location" className="form-input" style={{ flex: 1, padding: '8px' }} value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} />
                                                <button type="button" onClick={() => handleGetLocation(false)} className="btn-primary" style={{ padding: '8px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', width: 'auto', flex: 'none', display: 'flex', alignItems: 'center' }} title="Use Current Location">
                                                    <Crosshair size={18} className={loadingLocation ? 'spin' : ''} />
                                                </button>
                                            </div>
                                            <input required type="text" placeholder="Destination Location" className="form-input" style={{ padding: '8px' }} value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Start Time</label>
                                                    <input required type="datetime-local" className="form-input" style={{ padding: '8px' }} value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Exp. Arrival</label>
                                                    <input required type="datetime-local" className="form-input" style={{ padding: '8px' }} value={formData.expectedArrival} onChange={e => setFormData({ ...formData, expectedArrival: e.target.value })} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px' }}>Confirm Trip</button>
                                                <button type="button" onClick={() => setBookingForm(null)} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <button onClick={() => {
                                            setBookingForm(vehicle.id);
                                            // Copy route explorer data if available
                                            if (routeResult) {
                                                setFormData(prev => ({ ...prev, source: route.source, destination: route.destination }));
                                            }
                                        }} className="btn-primary" style={{ padding: '8px' }}>Book Vehicle</button>
                                    )}
                                </div>
                            )) : (
                                <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    No vehicles currently available for booking.
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'explorer' && (
                    <>
                        <h1 className="page-title">Route Explorer</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Plan your route, get location intelligence, and estimate travel distance.</p>

                        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                            <form onSubmit={calculateDistance} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1', minWidth: '250px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>Starting Location</label>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input required type="text" placeholder="e.g. New York, Times Square" className="form-input" style={{ flex: 1 }} value={route.source} onChange={e => setRoute({ ...route, source: e.target.value })} />
                                        <button type="button" onClick={() => handleGetLocation(true)} className="btn-primary" style={{ padding: '12px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)', width: 'auto', flex: 'none', display: 'flex', alignItems: 'center' }} title="Use Current GPS">
                                            <Crosshair size={18} className={loadingLocation ? 'spin' : ''} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ flex: '1', minWidth: '250px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>Destination</label>
                                    <input required type="text" placeholder="e.g. Washington DC" className="form-input" value={route.destination} onChange={e => setRoute({ ...route, destination: e.target.value })} />
                                </div>
                                <button type="submit" className="btn-primary" style={{ padding: '12px 25px', height: '47px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Map size={18} /> Calculate Distance
                                </button>
                            </form>

                            {routeResult && (
                                <div>
                                    <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.3)', borderRadius: '12px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '13px', color: 'var(--bg-accent)', marginBottom: '5px' }}>ESTIMATED DISTANCE</div>
                                            <div style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{routeResult.distance} <span style={{ fontSize: '18px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>km</span></div>
                                        </div>
                                        <div style={{ width: '1px', background: 'rgba(0,0,0,0.05)', height: '50px' }}></div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: 'var(--bg-accent)', marginBottom: '5px' }}>ESTIMATED TRAVEL TIME</div>
                                            <div style={{ fontSize: '32px', color: 'var(--text-primary)', fontWeight: 'bold' }}>{routeResult.time}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            <button onClick={() => setActiveTab('dashboard')} className="btn-primary" style={{ padding: '10px 20px' }}>Find Buses for Route</button>
                                        </div>
                                    </div>

                                    {/* Local Tourism Highlights */}
                                    {(() => {
                                        const touristData = {
                                            "chennai": [
                                                { name: "Marina Beach", wiki: "Marina_Beach", desc: "India's longest natural urban beach and a prime tourist attraction." },
                                                { name: "Kapaleeshwarar Temple", wiki: "Kapaleeshwarar_Temple,_Mylapore", desc: "A masterpiece of Dravidian architecture dedicated to Lord Shiva." },
                                                { name: "Santhome Cathedral", wiki: "San_Thome_Basilica", desc: "A majestic Roman Catholic basilica built over the tomb of St. Thomas." }
                                            ],
                                            "madurai": [
                                                { name: "Meenakshi Temple", wiki: "Meenakshi_Temple", desc: "A world-renowned historic Hindu temple covered in vivid sculptures." },
                                                { name: "Thirumalai Nayakkar", wiki: "Thirumalai_Nayakkar_Mahal", desc: "17th-century palace built by King Thirumalai blending Dravidian and Islamic styles." },
                                                { name: "Gandhi Memorial", wiki: "Gandhi_Memorial_Museum,_Madurai", desc: "Historic museum documenting India's struggle for independence." }
                                            ],
                                            "coimbatore": [
                                                { name: "Adiyogi Shiva", wiki: "Adiyogi_Shiva_statue", desc: "The world's largest bust sculpture standing at 112 feet." },
                                                { name: "Marudhamalai Temple", wiki: "Marudhamalai_temple", desc: "Famous 12th-century hill temple dedicated to Lord Murugan." },
                                                { name: "Siruvani Waterfalls", wiki: "Siruvani_Waterfalls", desc: "Spectacular waterfalls nested in the dense Western Ghats." }
                                            ],
                                            "trichy": [
                                                { name: "Srirangam Temple", wiki: "Ranganathaswamy_Temple,_Srirangam", desc: "The largest functioning Hindu temple complex in the world." },
                                                { name: "Rockfort Temple", wiki: "Tiruchirappalli_Rock_Fort", desc: "An ancient fort and temple complex built on a massive 3.8 billion-year-old rock." }
                                            ],
                                            "tiruchirappalli": [
                                                { name: "Srirangam Temple", wiki: "Ranganathaswamy_Temple,_Srirangam", desc: "The largest functioning Hindu temple complex in the world." },
                                                { name: "Rockfort Temple", wiki: "Tiruchirappalli_Rock_Fort", desc: "An ancient fort and temple complex built on a massive rock." }
                                            ],
                                            "salem": [
                                                { name: "Yercaud", wiki: "Yercaud", desc: "A beautiful hill station in the Shevaroy Hills famously known as the 'Jewel of the South'." },
                                                { name: "Kurumbapatti Park", wiki: "Kurumbapatti_Zoological_Park", desc: "A serene zoological park situated at the foothills of the Shervaroyan Hills." }
                                            ],
                                            "thanjavur": [
                                                { name: "Brihadisvara Temple", wiki: "Brihadisvara_Temple,_Thanjavur", desc: "An architectural marvel and UNESCO World Heritage site built by Raja Raja Chola." },
                                                { name: "Maratha Palace", wiki: "Thanjavur_Maratha_Palace", desc: "Historic palace that served as the official residence of the Bhonsle family." }
                                            ],
                                            "kodaikanal": [
                                                { name: "Kodai Lake", wiki: "Kodaikanal_Lake", desc: "A stunning artificial, star-shaped lake situated in the heart of the city." },
                                                { name: "Pillar Rocks", wiki: "Pillar_Rocks", desc: "Three giant rock pillars standing 400 feet high in a serene setting." }
                                            ],
                                            "rameswaram": [
                                                { name: "Ramanathaswamy Temple", wiki: "Ramanathaswamy_Temple", desc: "One of the twelve Jyotirlinga temples featuring the longest corridor in the world." },
                                                { name: "Dhanushkodi", wiki: "Dhanushkodi", desc: "An abandoned ghost town at the south-eastern tip of Pamban Island." }
                                            ],
                                            "dindigul": [
                                                { name: "Palani Temple", wiki: "Palani_Murugan_temple", desc: "One of the Six Abodes of Lord Murugan, globally renowned and located on the Palani Hills." },
                                                { name: "Kodaikanal Lake", wiki: "Kodaikanal_Lake", desc: "A stunning artificial, star-shaped lake situated in the 'Princess of Hill Stations'." },
                                                { name: "Dindigul Rock Fort", wiki: "Dindigul_Fort", desc: "A 17th-century hill fort built by the Madurai Nayaks offering panoramic views." },
                                                { name: "Sirumalai Hills", wiki: "Sirumalai", desc: "A dense, serene biosphere reserve with beautiful viewpoints and flora." }
                                            ],
                                            "tirunelveli": [
                                                { name: "Nellaiappar Temple", wiki: "Nellaiappar_Temple", desc: "Ancient Shiva temple built globally famous for its musical pillars." },
                                                { name: "Courtallam Falls", wiki: "Courtallam", desc: "A breathtaking waterfall complex often called the 'Spa of South India'." }
                                            ],
                                            "vellore": [
                                                { name: "Vellore Fort", wiki: "Vellore_Fort", desc: "A large 16th-century fort renowned for its grand ramparts and moat." },
                                                { name: "Sripuram Golden Temple", wiki: "Sripuram", desc: "A spiritual park and temple covered entirely in pure gold foil." }
                                            ],
                                            "erode": [
                                                { name: "Bhavanisagar Dam", wiki: "Bhavanisagar_Dam", desc: "One of the largest earthen dams in the world constructed after independence." },
                                                { name: "Chennimalai Temple", wiki: "Chennimalai_Murugan_Temple", desc: "A sacred hilltop temple dedicated to Lord Murugan." }
                                            ],
                                            "kanyakumari": [
                                                { name: "Vivekananda Rock", wiki: "Vivekananda_Rock_Memorial", desc: "A mesmerizing memorial situated on a rock island where two oceans meet." },
                                                { name: "Thiruvalluvar Statue", wiki: "Thiruvalluvar_Statue", desc: "Towering 133-feet tall stone sculpture of the Tamil poet and philosopher." }
                                            ],
                                            "ooty": [
                                                { name: "Ooty Lake", wiki: "Ooty_Lake", desc: "A pristine artificial lake constructed in 1824, famous for boating." },
                                                { name: "Botanical Gardens", wiki: "Government_Botanical_Gardens,_Ooty", desc: "Lush gardens featuring a fossilized tree trunk that is 20 million years old." }
                                            ],
                                            "kochi": [
                                                { name: "Fort Kochi Nets", wiki: "Chinese_fishing_nets", desc: "Historic town famous for iconic Chinese fishing nets and colonial architecture." },
                                                { name: "Mattancherry Palace", wiki: "Mattancherry_Palace", desc: "A Portuguese palace popularly known as the Dutch Palace." }
                                            ],
                                            "bengaluru": [
                                                { name: "Lalbagh Botanical Garden", wiki: "Lalbagh", desc: "Historic garden featuring India's largest collection of tropical plants." },
                                                { name: "Bangalore Palace", wiki: "Bangalore_Palace", desc: "Stunning 19th-century royal palace inspired by Windsor Castle." },
                                                { name: "Vidhana Soudha", wiki: "Vidhana_Soudha", desc: "Imposing Neo-Dravidian architecture housing the state legislature." }
                                            ],
                                            "mumbai": [
                                                { name: "Gateway of India", wiki: "Gateway_of_India", desc: "Iconic arch-monument overlooking the expansive Arabian Sea." },
                                                { name: "Marine Drive", wiki: "Marine_Drive,_Mumbai", desc: "A beautiful 3km-long boulevard in South Mumbai shaped like a 'C'." }
                                            ],
                                            "agra": [
                                                { name: "Taj Mahal", wiki: "Taj_Mahal", desc: "The legendary ivory-white marble mausoleum on the river Yamuna." },
                                                { name: "Agra Fort", wiki: "Agra_Fort", desc: "A towering historical fort and the main residence of Mughal emperors." }
                                            ],
                                            "delhi": [
                                                { name: "India Gate", wiki: "India_Gate", desc: "A magnificent war memorial located astride the historic Rajpath." },
                                                { name: "Red Fort", wiki: "Red_Fort", desc: "Famous 17th-century Mughal fortress known for its massive red sandstone walls." }
                                            ]
                                        };

                                        // Fallback normalization logic
                                        const dest = route.destination.toLowerCase();
                                        let spots = [
                                            { name: `Explore ${route.destination.split(',')[0]}`, desc: `Discover the rich local culture, authentic cuisine, and beautiful scenic sights naturally located around this destination.` }
                                        ];

                                        for (const [city, data] of Object.entries(touristData)) {
                                            if (dest.includes(city)) {
                                                spots = data;
                                                break;
                                            }
                                        }

                                        return (
                                            <div style={{ marginTop: '40px' }}>
                                                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '15px' }}>Top Tourist Highlights</h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                                    {spots.map((spot, idx) => {
                                                        const TouristSpotCard = ({ spotItem }) => {
                                                            const [img, setImg] = useState('');

                                                            useEffect(() => {
                                                                if (spotItem.wiki) {
                                                                    fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${spotItem.wiki}&prop=pageimages&format=json&pithumbsize=400&origin=*`)
                                                                        .then(res => res.json())
                                                                        .then(data => {
                                                                            const pages = data.query?.pages;
                                                                            if (pages && Object.keys(pages)[0] !== "-1") {
                                                                                const page = Object.values(pages)[0];
                                                                                if (page.thumbnail) setImg(page.thumbnail.source);
                                                                                else setImg(`https://picsum.photos/seed/${spotItem.name.replace(/ /g, '')}/400/300`);
                                                                            } else {
                                                                                setImg(`https://picsum.photos/seed/${spotItem.name.replace(/ /g, '')}/400/300`);
                                                                            }
                                                                        }).catch(() => setImg(`https://picsum.photos/seed/${spotItem.name.replace(/ /g, '')}/400/300`));
                                                                } else {
                                                                    setImg(`https://picsum.photos/seed/${spotItem.name.replace(/ /g, '')}/400/300`);
                                                                }
                                                            }, [spotItem]);

                                                            return (
                                                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                                                                    <div style={{ height: '160px', width: '100%', backgroundImage: `url(${img || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#e2e8f0' }}></div>
                                                                    <div style={{ padding: '15px' }}>
                                                                        <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>{spotItem.name}</h4>
                                                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{spotItem.desc}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        };
                                                        return <TouristSpotCard key={idx} spotItem={spot} />;
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'bookings' && (
                    <>
                        <h1 className="page-title">My Bookings & Trip Plans</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Track your active trips and booking history here.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {bookings.length > 0 ? bookings.map(booking => (
                                <div key={booking.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ flex: '1', minWidth: '200px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--bg-accent)', marginBottom: '5px', fontWeight: 'bold' }}>BOOKING ID: #{booking.id}</div>
                                        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{booking.vehicle?.brand} {booking.vehicle?.model}</h3>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '5px' }}>Status: <span style={{ color: booking.status === 'CONFIRMED' ? '#4facfe' : booking.status === 'CANCELLED' ? '#ff4b4b' : 'orange' }}>{booking.status}</span></div>
                                    </div>

                                    {booking.trip && (
                                        <div style={{ flex: '2', minWidth: '250px', background: 'var(--bg-main)', padding: '15px', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <Navigation size={16} color="var(--bg-accent)" />
                                                <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{booking.trip.source} <span style={{ color: 'var(--text-secondary)', margin: '0 5px' }}>→</span> {booking.trip.destination}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(booking.trip.startTime).toLocaleString()}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {new Date(booking.trip.expectedArrival).toLocaleTimeString()}</span>
                                            </div>

                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', fontSize: '13px' }}>
                                                {booking.trip.driver ? (
                                                    <div style={{ color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <CheckCircle size={14} /> Driver Assigned: {booking.trip.driver.user?.name} (Status: {booking.trip.driver.availabilityStatus})
                                                    </div>
                                                ) : (
                                                    <div style={{ color: 'orange' }}>⏳ Awaiting driver assignment by Admin.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === 'PENDING' && (
                                        <button onClick={async () => {
                                            try {
                                                await api.put(`/bookings/${booking.id}/cancel`);
                                                fetchBookings();
                                            } catch (e) { alert("Failed to cancel.") }
                                        }} className="btn-primary" style={{ background: '#ff4b4b', border: 'none', padding: '8px 15px' }}>Cancel</button>
                                    )}
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                    You have no bookings yet. Go to your Dashboard to book a vehicle.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
