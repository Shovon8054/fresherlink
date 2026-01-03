import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupStudent, signupCompany } from '../services/api';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

function LoginPage({ initialIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState(''); ``
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (isLogin) response = await loginUser({ email, password });
      else {
        response = role === 'student'
          ? await signupStudent({ email, password })
          : await signupCompany({ email, password });
      }
      const { token, role: userRole, userId } = response.data;
      auth.login(token, userRole, { userId });
      if (!isLogin) alert('Account created successfully!');
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate(userRole === 'student' ? '/student' : '/company');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (

    <div className={styles.pageWrapper}>
      <title>Log in page</title>

      {/* LEFT SIDE: Form */}
      <div className={styles.leftSide}>
        <div className={styles.card}>
          <h1 className={styles.title}>FresherLink</h1>
          <h2 className={styles.subtitle}>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="flex gap-4 justify-center mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="student" checked={role === 'student'} onChange={(e) => setRole(e.target.value)} />
                  Student
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="company" checked={role === 'company'} onChange={(e) => setRole(e.target.value)} />
                  Company
                </label>
              </div>
            )}

            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.inputField}
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button type="submit" className={styles.submitBtn}>
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p className={styles.toggleText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className={styles.linkBtn}>
              {isLogin ? "Create one" : "Login"}
            </button>
          </p>

          <button onClick={() => navigate('/jobs')} className={styles.guestButton}>
            Browse as Guest
          </button>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;