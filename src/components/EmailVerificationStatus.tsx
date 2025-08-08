import React from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EmailVerificationStatusProps {
  email: string;
  isVerified?: boolean;
  onResendVerification?: () => void;
  loading?: boolean;
}

const EmailVerificationStatus: React.FC<EmailVerificationStatusProps> = ({
  email,
  isVerified = false,
  onResendVerification,
  loading = false
}) => {
  if (!email) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Mail size={16} />
        <span>No email provided</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Mail size={16} />
        <span className="text-gray-400">{email}</span>
        {isVerified ? (
          <div className="flex items-center space-x-1 text-green-400">
            <CheckCircle size={14} />
            <span className="text-xs">Verified</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-yellow-400">
            <AlertCircle size={14} />
            <span className="text-xs">Unverified</span>
          </div>
        )}
      </div>
      
      {!isVerified && onResendVerification && (
        <button
          onClick={onResendVerification}
          disabled={loading}
          className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Resend verification'}
        </button>
      )}
    </div>
  );
};

export default EmailVerificationStatus; 