
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="text-zarfuel-blue mb-4">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-3xl font-bold mb-2 text-center">Access Denied</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You do not have permission to access this page. Please contact your administrator for assistance.
      </p>
      <Button asChild>
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
};

export default Unauthorized;
