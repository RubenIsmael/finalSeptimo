// types.d.ts - Archivo de declaraciones de tipos globales para Expo/React Native

// Declaraciones para módulos de Babel (evita errores de tipos faltantes)
declare module 'babel__core' {
  const babel: any;
  export = babel;
}

declare module 'babel__generator' {
  const generator: any;
  export = generator;
}

declare module 'babel__template' {
  const template: any;
  export = template;
}

declare module 'babel__traverse' {
  const traverse: any;
  export = traverse;
}

declare module 'babel__types' {
  const types: any;
  export = types;
}

// Declaraciones para librerías de testing/coverage
declare module 'istanbul-lib-report' {
  const report: any;
  export = report;
}

declare module 'istanbul-reports' {
  const reports: any;
  export = reports;
}

declare module 'istanbul-lib-coverage' {
  const coverage: any;
  export = coverage;
}

// Declaraciones para librerías de mapas y geometría
declare module 'geojson' {
  export interface GeoJSON {
    type: string;
    [key: string]: any;
  }
  export interface Feature {
    type: 'Feature';
    geometry: any;
    properties: any;
  }
  export interface FeatureCollection {
    type: 'FeatureCollection';
    features: Feature[];
  }
}

// Declaraciones para librerías de gestos
declare module 'hammerjs' {
  const Hammer: any;
  export = Hammer;
}

// Declaraciones para assets estáticos
declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare module '*.gif' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  const value: any;
  export = value;
}

// Declaraciones para WebView
declare module 'react-native-webview' {
  export const WebView: any;
}

// Declaraciones adicionales que pueden aparecer en proyectos Expo
declare module 'expo-constants' {
  const Constants: any;
  export default Constants;
}

declare module 'expo-permissions' {
  const Permissions: any;
  export default Permissions;
}

declare module 'expo-location' {
  const Location: any;
  export default Location;
}

// Solución global para cualquier módulo que cause problemas
declare module '*';