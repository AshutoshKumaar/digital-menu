import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.digitalmenu.billmenu',
  appName: 'Bill Menu',
  webDir: '.next', 
  server: {
    url: "https://digital-menu-ivory-gamma.vercel.app/", // 👈 apna hosted URL
    cleartext: true
  }
};

export default config;
