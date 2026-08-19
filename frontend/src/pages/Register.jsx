import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/customer-dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top left, #1e293b, #0f172a)' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join Smart Transport Platform</p>
                </div>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" className="input-field" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                    <input type="email" name="email" className="input-field" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    <input type="text" name="phone" className="input-field" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                    <input type="password" name="password" className="input-field" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleChange} required minLength={6} />

                    <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        Register <UserPlus size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--bg-accent)', textDecoration: 'none', fontWeight: '500' }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
