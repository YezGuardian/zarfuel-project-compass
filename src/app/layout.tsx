'use client';

import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import '../index.css';

// Initialize the application
async function initializeApp() {
  try {
    const response = await fetch('/api/init');
    const data = await response.json();
    console.log('App initialization:', data.success ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Only run on client
    initializeApp();
  }, []);

  return (
    <div className="app-container">
      <AuthProvider>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </AuthProvider>
    </div>
  );
} 