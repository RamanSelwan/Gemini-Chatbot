
'use client';

import { useState, useEffect } from 'react';
import { Country } from '@/lib/types';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data: Country[] = await response.json();
        const sortedCountries = data
          .filter(country => country.idd?.root && country.idd?.suffixes)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        
        setCountries(sortedCountries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
}
