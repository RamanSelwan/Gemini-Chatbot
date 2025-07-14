
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneSchema, PhoneFormData } from '@/lib/validation';
import { useCountries } from '@/hooks/useCountries';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onOtpSent: (phone: string, countryCode: string) => void;
}

export function LoginForm({ onOtpSent }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const { countries, isLoading: countriesLoading } = useCountries();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: '',
      countryCode: ''
    }
  });

  const countryCode = watch('countryCode') || '';

  const onSubmit = async (data: PhoneFormData) => {
    setIsLoading(true);
    
    setTimeout(() => {
      toast.success('OTP sent successfully!');
      onOtpSent(data.phone, data.countryCode);
      setIsLoading(false);
    }, 1500);
  };

  const handleCountrySelect = (country: any) => {
    const dialCode = country.idd.root + (country.idd.suffixes?.[0] || '');
    setValue('countryCode', dialCode);
    setSelectedCountry(`${country.flag} ${country.name.common} (${dialCode})`);
    setShowCountries(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to Gemini Chat
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your phone number to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Country
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountries(!showCountries)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-left text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>
                {selectedCountry || 'Select country'}
              </span>
              <i className="ri-arrow-down-s-line text-gray-400"></i>
            </button>
            
            {showCountries && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {countriesLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : (
                  countries.map((country) => (
                    <button
                      key={country.cca2}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 flex items-center space-x-2"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name.common}</span>
                      <span className="text-gray-500">
                        ({country.idd.root}{country.idd.suffixes?.[0]})
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.countryCode && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.countryCode.message}
            </p>
          )}
          <input type="hidden" {...register('countryCode')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="flex space-x-2">
            <div className="w-20">
              <Input
                value={countryCode}
                readOnly
                className="text-center"
                placeholder="+1"
              />
            </div>
            <div className="flex-1">
              <Input
                {...register('phone')}
                type="tel"
                placeholder="123456789"
                error={errors.phone?.message}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Send OTP
        </Button>
      </form>
    </div>
  );
}