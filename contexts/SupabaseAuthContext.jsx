// This file is deprecated and should not be used. 
// Please use src/contexts/AuthContext.jsx instead.
import React from 'react';

export const AuthProvider = ({ children }) => <>{children}</>;
export const useAuth = () => {
  throw new Error("SupabaseAuthContext is deprecated. Use AuthContext instead.");
};