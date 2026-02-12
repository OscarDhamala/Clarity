import axios from 'axios';
import { ChangeEvent, FormEventHandler, useEffect, useState } from 'react';
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

  const passwordPolicy =
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let response: AuthResponse;

      if (mode === 'register') {
        const policyRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!policyRegex.test(formValues.password)) {
          setError(passwordPolicy);
          setIsSubmitting(false);
          return;
        }
        response = await registerUser(formValues);
      } else {
        response = await loginUser({
          email: formValues.email,
          password: formValues.password,
        });
      }

      onAuthSuccess(response);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage =
          (Array.isArray(err.response?.data?.errors) && err.response?.data?.errors.join(' ')) ||
          err.response?.data?.message;
        setError(apiMessage || 'Recheck your details and try again.');
      } else {
        setError('Recheck your details and try again.');
      }
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
            placeholder="name@gmail.com"
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
            placeholder="At least 8 characters"
            value={formValues.password}
            onChange={handleChange}
            required
            minLength={8}
            pattern={
              isRegister
                ? '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$'
                : undefined
            }
            title={passwordPolicy}
          />
          {isRegister && <small className="input-hint">{passwordPolicy}</small>}
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
