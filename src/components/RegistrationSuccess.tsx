import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Registration Submitted!</h2>
        <p className="text-gray-400 mb-8">
          Your registration has been submitted successfully. The team administrator will review your application and get back to you soon.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}