/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#3E8E5A'; // Herbal Green
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Ayurahaar specific colors
    herbalGreen: '#3E8E5A',
    softOrange: '#F4A261',
    lightGreen: '#E8F5E8',
    lightOrange: '#FDF4E8',
    cardBackground: '#FAFAFA',
    inputBorder: '#E0E0E0',
    sectionHeader: '#2C5F41',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Ayurahaar specific colors
    herbalGreen: '#4A9D6A',
    softOrange: '#F4A261',
    lightGreen: '#2A4A2A',
    lightOrange: '#3A3220',
    cardBackground: '#1E1E1E',
    inputBorder: '#404040',
    sectionHeader: '#4A9D6A',
  },
};
