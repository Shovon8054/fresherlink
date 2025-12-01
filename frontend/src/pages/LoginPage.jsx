import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupStudent, signupCompany } from '../services/api';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      
      if (isLogin) {
        response = await loginUser({ email, password });
      } else {
        if (role === 'student') {
          response = await signupStudent({ email, password });
        } else {
          response = await signupCompany({ email, password });
        }
      }

      const { token, role: userRole, userId } = response.data;
      
      // Store all auth data
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('userId', userId);

      // Show success message
      if (!isLogin) {
        alert('Account created successfully! Please create your profile.');
      }

      // Redirect based on role
      if (userRole === 'student') {
        navigate('/student');
      } else {
        navigate('/company');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      console.error('Auth error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>FresherLink</h1>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label>I am a:</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                />
                Student
              </label>
              <label style={{ marginLeft: '15px' }}>
                <input
                  type="radio"
                  value="company"
                  checked={role === 'company'}
                  onChange={(e) => setRole(e.target.value)}
                />
                Company
              </label>
            </div>
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>

      <button
        onClick={() => navigate('/jobs')}
        style={{ marginTop: '10px', padding: '10px' }}
      >
        Browse Jobs (No Login Required)
      </button>
    </div>
  );
}

export default LoginPage;