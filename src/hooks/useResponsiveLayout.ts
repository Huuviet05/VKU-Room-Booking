// src/hooks/useResponsiveLayout.ts
import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isLandscape: width > height,
    isTablet: width >= 768,
    columns: width >= 768 ? 3 : width >= 480 ? 2 : 1,
    cardWidth: width >= 768 ? (width - 48 - 24) / 3 : width - 32,
    horizontalPadding: width >= 768 ? 24 : 16,
  };
}
