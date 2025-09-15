import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/useColorScheme';
import { PermissionsProvider } from '@/src/contexts/PermissionsContext';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { LanguageProvider } from '@/src/contexts/LanguageContext';

// Initialize i18n
import '@/src/config/i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <PermissionsProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen 
              name="home" 
              options={{ 
                headerShown: false,
                gestureEnabled: false  // Disable swipe back gesture
              }} 
            />
            <Stack.Screen name="explore" options={{ headerShown: false }} />
            <Stack.Screen name="survey" options={{ headerShown: false }} />
            <Stack.Screen 
              name="auth" 
              options={{ 
                headerShown: false,
                gestureEnabled: false  // Disable swipe back gesture
              }} 
            />
            <Stack.Screen name="plan-selection" options={{ headerShown: false }} />
            <Stack.Screen name="ai-plan-generation" options={{ headerShown: false }} />
            <Stack.Screen name="doctor-list" options={{ headerShown: false }} />
            <Stack.Screen name="book-appointment" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="appointments" options={{ headerShown: false }} />
            <Stack.Screen name="chatbot" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="food-details" options={{ headerShown: false }} />
            <Stack.Screen name="view-prakriti" options={{ headerShown: false }} />
            <Stack.Screen name="body-constitution" options={{ headerShown: false }} />
            <Stack.Screen name="full-plan-details" options={{ headerShown: false }} />
            <Stack.Screen name="ayurveda-info" options={{ headerShown: false }} />
            <Stack.Screen name="comprehensive-survey" options={{ headerShown: false }} />
            <Stack.Screen name="dev-tools" options={{ headerShown: true, title: 'Dev Tools' }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PermissionsProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}
