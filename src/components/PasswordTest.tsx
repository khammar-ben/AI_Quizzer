import React, { useState } from 'react';

const PasswordTest = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validation = validatePassword(password);
  const isStrong = Object.values(validation).every(Boolean);
  const doMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white mb-4">Password Test</h3>
      
      <div className="space-y-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
        
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full p-2 bg-gray-700 text-white rounded"
        />
      </div>

      <div className="mt-4 space-y-1">
        <div className={`text-sm ${validation.length ? 'text-green-400' : 'text-red-400'}`}>
          Length (8+): {validation.length ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${validation.uppercase ? 'text-green-400' : 'text-red-400'}`}>
          Uppercase: {validation.uppercase ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${validation.lowercase ? 'text-green-400' : 'text-red-400'}`}>
          Lowercase: {validation.lowercase ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${validation.number ? 'text-green-400' : 'text-red-400'}`}>
          Number: {validation.number ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${validation.special ? 'text-green-400' : 'text-red-400'}`}>
          Special: {validation.special ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${doMatch ? 'text-green-400' : 'text-red-400'}`}>
          Match: {doMatch ? '✅' : '❌'}
        </div>
        <div className={`text-sm ${isStrong ? 'text-green-400' : 'text-red-400'}`}>
          Strong: {isStrong ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

export default PasswordTest; 