/**
 * AppsInToss 인앱 광고 SDK 래퍼
 * 
 * 문서: https://developers-apps-in-toss.toss.im/ads/develop.html
 * 
 * 테스트 광고 ID:
 * - 전면형 광고: ait-ad-test-interstitial-id
 * - 리워드 광고: ait-ad-test-rewarded-id
 */

// SDK 타입 정의
interface LoadAdMobOptions {
  adGroupId: string;
}

interface ShowAdMobOptions {
  adGroupId: string;
}

type LoadAdMobEventType = 'loaded';

interface LoadAdMobEvent {
  type: LoadAdMobEventType;
  data?: unknown;
}

type ShowAdMobEventType = 
  | 'requested' 
  | 'clicked' 
  | 'dismissed' 
  | 'failedToShow' 
  | 'impression' 
  | 'show'
  | 'userEarnedReward';

interface ShowAdMobEvent {
  type: ShowAdMobEventType;
  data?: {
    unitType?: string;
    unitAmount?: number;
  };
}

interface LoadAdMobParams {
  options: LoadAdMobOptions;
  onEvent: (event: LoadAdMobEvent) => void;
  onError: (error: Error) => void;
}

interface ShowAdMobParams {
  options: ShowAdMobOptions;
  onEvent: (event: ShowAdMobEvent) => void;
  onError: (error: Error) => void;
}

interface GoogleAdMobSDK {
  loadAppsInTossAdMob: {
    (params: LoadAdMobParams): () => void;
    isSupported: () => boolean;
  };
  showAppsInTossAdMob: {
    (params: ShowAdMobParams): () => void;
    isSupported: () => boolean;
  };
}

// SDK 접근
declare global {
  interface Window {
    AppsInToss?: {
      GoogleAdMob?: GoogleAdMobSDK;
    };
  }
}

// SDK import (실제 환경에서는 @apps-in-toss/web-framework 사용)
const getGoogleAdMob = (): GoogleAdMobSDK | null => {
  // 실제 AppsInToss 환경에서는 SDK 사용
  if (typeof window !== 'undefined' && window.AppsInToss?.GoogleAdMob) {
    return window.AppsInToss.GoogleAdMob;
  }
  return null;
};

// 광고 상태 타입
export type AdLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

// 리워드 광고 매니저
export class RewardedAdManager {
  private adGroupId: string;
  private status: AdLoadStatus = 'idle';
  private cleanup: (() => void) | null = null;

  constructor(adGroupId: string) {
    this.adGroupId = adGroupId;
  }

  getStatus(): AdLoadStatus {
    return this.status;
  }

  isSupported(): boolean {
    const sdk = getGoogleAdMob();
    return sdk?.loadAppsInTossAdMob?.isSupported() === true;
  }

  /**
   * 광고 미리 로드
   */
  async load(): Promise<boolean> {
    const sdk = getGoogleAdMob();
    
    if (!sdk) {
      console.warn('[RewardedAd] SDK not available, using mock mode');
      // Mock 모드: 개발/테스트용
      this.status = 'loading';
      await new Promise(resolve => setTimeout(resolve, 500));
      this.status = 'loaded';
      return true;
    }

    if (!sdk.loadAppsInTossAdMob.isSupported()) {
      console.warn('[RewardedAd] loadAppsInTossAdMob not supported');
      return false;
    }

    return new Promise((resolve) => {
      this.status = 'loading';

      this.cleanup = sdk.loadAppsInTossAdMob({
        options: {
          adGroupId: this.adGroupId,
        },
        onEvent: (event) => {
          console.log('[RewardedAd] Load event:', event.type);
          
          if (event.type === 'loaded') {
            this.status = 'loaded';
            this.cleanup?.();
            this.cleanup = null;
            resolve(true);
          }
        },
        onError: (error) => {
          console.error('[RewardedAd] Load error:', error);
          this.status = 'error';
          this.cleanup?.();
          this.cleanup = null;
          resolve(false);
        },
      });
    });
  }

  /**
   * 광고 표시 및 리워드 대기
   */
  async show(): Promise<{ success: boolean; rewarded: boolean; reward?: { unitType: string; unitAmount: number } }> {
    const sdk = getGoogleAdMob();

    if (!sdk) {
      console.warn('[RewardedAd] SDK not available, using mock mode');
      // Mock 모드: 시뮬레이션
      this.status = 'idle';
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, rewarded: true, reward: { unitType: 'coin', unitAmount: 1 } };
    }

    if (this.status !== 'loaded') {
      console.error('[RewardedAd] Ad not loaded yet');
      return { success: false, rewarded: false };
    }

    if (!sdk.showAppsInTossAdMob.isSupported()) {
      console.warn('[RewardedAd] showAppsInTossAdMob not supported');
      return { success: false, rewarded: false };
    }

    return new Promise((resolve) => {
      let rewarded = false;
      let rewardData: { unitType: string; unitAmount: number } | undefined;

      sdk.showAppsInTossAdMob({
        options: {
          adGroupId: this.adGroupId,
        },
        onEvent: (event) => {
          console.log('[RewardedAd] Show event:', event.type, event.data);

          switch (event.type) {
            case 'show':
              console.log('[RewardedAd] Ad shown');
              break;
            case 'requested':
              console.log('[RewardedAd] Ad requested');
              this.status = 'idle'; // 다음 광고를 위해 상태 리셋
              break;
            case 'impression':
              console.log('[RewardedAd] Ad impression');
              break;
            case 'clicked':
              console.log('[RewardedAd] Ad clicked');
              break;
            case 'userEarnedReward':
              console.log('[RewardedAd] User earned reward:', event.data);
              rewarded = true;
              rewardData = event.data as { unitType: string; unitAmount: number };
              break;
            case 'dismissed':
              console.log('[RewardedAd] Ad dismissed');
              resolve({ success: true, rewarded, reward: rewardData });
              break;
            case 'failedToShow':
              console.error('[RewardedAd] Failed to show');
              resolve({ success: false, rewarded: false });
              break;
          }
        },
        onError: (error) => {
          console.error('[RewardedAd] Show error:', error);
          resolve({ success: false, rewarded: false });
        },
      });
    });
  }

  /**
   * 광고 로드 후 표시 (한번에)
   */
  async loadAndShow(): Promise<{ success: boolean; rewarded: boolean; reward?: { unitType: string; unitAmount: number } }> {
    const loaded = await this.load();
    
    if (!loaded) {
      return { success: false, rewarded: false };
    }

    return this.show();
  }

  dispose() {
    this.cleanup?.();
    this.cleanup = null;
    this.status = 'idle';
  }
}

// 테스트용 광고 ID
export const TEST_AD_IDS = {
  INTERSTITIAL: 'ait-ad-test-interstitial-id',
  REWARDED: 'ait-ad-test-rewarded-id',
} as const;

// 싱글톤 인스턴스 (리워드 광고용)
let rewardedAdInstance: RewardedAdManager | null = null;

export function getRewardedAdManager(adGroupId: string = TEST_AD_IDS.REWARDED): RewardedAdManager {
  if (!rewardedAdInstance || rewardedAdInstance['adGroupId'] !== adGroupId) {
    rewardedAdInstance = new RewardedAdManager(adGroupId);
  }
  return rewardedAdInstance;
}
