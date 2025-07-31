// adsService.ts
import { InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712';
export const interstitial = InterstitialAd.createForAdRequest(adUnitId);
