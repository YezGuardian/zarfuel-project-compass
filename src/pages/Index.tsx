
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/login');
    }
    // If user is logged in, redirect to dashboard
    else {
      navigate('/');
    }
  }, [user, navigate]);
  
  return null; // This page is just for redirection
};

export default Index;
