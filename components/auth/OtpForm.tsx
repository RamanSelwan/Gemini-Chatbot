
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpFormData } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface OtpFormProps {
  phone: string;
  countryCode: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OtpForm({ phone, countryCode, onVerify, onBack }: OtpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const timer = resendTimer > 0 ? setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000) : null;

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue('otp', newOtp.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      if (otpValue === '123456') {
        toast.success('Phone verified successfully!');
        onVerify();
      } else {
        toast.error('Invalid OTP. Try 123456 for demo.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleResend = () => {
    setResendTimer(30);
    toast.success('OTP sent again!');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Verify Phone
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the 6-digit code sent to
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          {countryCode} {phone}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Use 123456 for demo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
            Enter OTP
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ))}
          </div>
          {errors.otp && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Verify OTP
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in {resendTimer}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
