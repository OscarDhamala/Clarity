import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthPanel from '../components/AuthPanel';
import { AuthResponse } from '../types';

interface LandingPageProps {
  onAuthSuccess: (payload: AuthResponse) => void;
  isLoggedIn: boolean;
  userName?: string | null;
}

const LandingPage = ({ onAuthSuccess, isLoggedIn, userName }: LandingPageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  return (
    <main className="landing">
      <section className="hero">
        <p className="badge">Personal finance, simplified</p>
        <h1>Clarity helps you understand where every rupee goes.</h1>
        <p className="hero-copy">
          Track income, monitor expenses, and spot trends without digging through messy
          spreadsheets. Learn the basics of budgeting with tools that stay out of your way.
        </p>
        <ul className="hero-list">
          <li>See every transaction in one timeline</li>
          <li>Filter by category or date in a click</li>
          <li>Beautiful and visually appealing dashboards</li>
        </ul>

        {isLoggedIn && (
          <button className="primary-btn" onClick={() => navigate('/dashboard')}>
            Continue as {userName || 'you'}
          </button>
        )}
      </section>

      <section className="landing-form">
        <AuthPanel onAuthSuccess={onAuthSuccess} />
      </section>
    </main>
  );
};

export default LandingPage;
