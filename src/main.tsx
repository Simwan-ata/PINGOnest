import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', padding: '24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '500px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#4338ca', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>بارگذاری اولیه نیازمند بروزرسانی است</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.7' }}>برای همگام‌سازی کامل با آخرین نسخه پینگو و بازنشانی حافظه موقت مرورگر، لطفاً دکمه زیر را کلیک کنید.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                پاکسازی کَش و راه‌اندازی مجدد
              </button>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#334155', color: '#cbd5e1', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                بروزرسانی صفحه
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

