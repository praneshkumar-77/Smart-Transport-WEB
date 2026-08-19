import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MoveRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            navigate(`/${user.role.toLowerCase()}-dashboard`);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Sign in to Smart Transport</p>
                </div>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        className="input-field"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="input-field"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        Sign In <MoveRight size={18} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--bg-accent)', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
