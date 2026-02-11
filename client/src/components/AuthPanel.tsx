import { ChangeEvent, SubmitEvent, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/api';
import { AuthResponse } from '../types';

interface AuthPanelProps {
  onAuthSuccess: (payload: AuthResponse) => void;
}

const AuthPanel = ({ onAuthSuccess }: AuthPanelProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formValues, setFormValues] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let response: AuthResponse;

      if (mode === 'register') {
        response = await registerUser(formValues);
      } else {
        response = await loginUser({
          email: formValues.email,
          password: formValues.password,
        });
      }

      onAuthSuccess(response);
    } catch (err) {
      setError('Please recheck your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="auth-panel">
      <div className="auth-toggle">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {isRegister && (
          <label>
            <span>Name</span>
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
          </label>
        )}

        <label>
          <span>Email</span>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formValues.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={formValues.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default AuthPanel;
