import React from 'react';
import { Navigate } from 'react-router-dom';

const DocumentsPage: React.FC = () => {
  return <Navigate to="/documents" replace />;
};

export default DocumentsPage;
