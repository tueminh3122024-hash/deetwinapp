export const THEME = {
  colors: {
    background: '#04050C', // Ultra deep space black
    surface: '#0F121D',    // Deep navy surface
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    text: '#FFFFFF',
    textDim: '#A0A7B5',
    primary: '#00F0FF',    // Electric Cyan
    energy: '#FFD700',     // Cyber Gold
    stability: '#00FF9C',  // Matrix Green
    alert: '#FF2D55',      // Pulse Red
    border: '#1E2336',
    accent: '#7000FF',     // Purple neon
  },
  gradients: {
    background: ['#04050C', '#0A0E1F'],
    primary: ['#00F0FF', '#7000FF'],
    danger: ['#FF2D55', '#7000FF'],
    success: ['#00FF9C', '#00F0FF'],
  },
  glow: {
    primary: {
      shadowColor: '#00F0FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 10,
    },
    accent: {
      shadowColor: '#7000FF',
      shadowRadius: 20,
      shadowOpacity: 0.6,
    }
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 30,
    full: 9999,
  }
};

