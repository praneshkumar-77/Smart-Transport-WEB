import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MoveRight, UserPlus, Bus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box fade-in">
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-accent-light)', marginBottom: '15px' }}>
                        <UserPlus color="var(--bg-accent)" size={24} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Create an Account</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Join Smart Transport today</p>
                </div>

                {error && <div style={{ background: 'var(--bg-accent-light)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid var(--error)' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <select
                        className="form-input"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="CUSTOMER">Passenger</option>
                        <option value="DRIVER">Driver</option>
                    </select>

                    <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        Create Account <MoveRight size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--bg-accent)', textDecoration: 'none', fontWeight: '600' }}>Sign in instead</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
