import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jnlstudio.booth',
  appName: 'JNL Studio Booth',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;