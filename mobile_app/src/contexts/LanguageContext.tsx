import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { availableLanguages } from '../config/i18n';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => Promise<void>;
  availableLanguages: typeof availableLanguages;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize language from storage or device settings
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app-language');
        if (savedLanguage && availableLanguages[savedLanguage as keyof typeof availableLanguages]) {
          setCurrentLanguage(savedLanguage);
          await i18n.changeLanguage(savedLanguage);
        } else {
          // Use i18n's detected language
          setCurrentLanguage(i18n.language);
        }
      } catch (error) {
        console.log('Error initializing language:', error);
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const setLanguage = async (languageCode: string) => {
    try {
      setIsLoading(true);
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('app-language', languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.log('Error setting language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    availableLanguages,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};