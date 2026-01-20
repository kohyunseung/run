/**
 * AppsInToss 인앱 광고 SDK 래퍼
 *
 * 문서:
 * - https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/loadAppsInTossAdMob.html
 * - https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/showAppsInTossAdMob.html
 *
 * 테스트 광고 ID:
 * - 전면형 광고: ait-ad-test-interstitial-id
 * - 리워드 광고: ait-ad-test-rewarded-id
 */

import { GoogleAdMob } from "@apps-in-toss/web-framework";

export type AdLoadStatus = "idle" | "loading" | "loaded" | "error";

export class RewardedAdManager {
  private adGroupId: string;
  private status: AdLoadStatus = "idle";
  private cleanup: (() => void) | null = null;

  constructor(adGroupId: string) {
    this.adGroupId = adGroupId;
  }

  getStatus(): AdLoadStatus {
    return this.status;
  }

  isSupported(): boolean {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported() === true;
  }

  async load(): Promise<boolean> {
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) {
      console.warn("[RewardedAd] loadAppsInTossAdMob not supported");
      return false;
    }

    return new Promise((resolve) => {
      this.status = "loading";

      this.cleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: {
          adGroupId: this.adGroupId,
        },
        onEvent: (event) => {
          if (event.type === "loaded") {
            this.status = "loaded";
            this.cleanup?.();
            this.cleanup = null;
            resolve(true);
          }
        },
        onError: (error) => {
          console.error("[RewardedAd] Load error:", error);
          this.status = "error";
          this.cleanup?.();
          this.cleanup = null;
          resolve(false);
        },
      });
    });
  }

  async show(): Promise<{
    success: boolean;
    rewarded: boolean;
    reward?: { unitType: string; unitAmount: number };
  }> {
    if (this.status !== "loaded") {
      console.error("[RewardedAd] Ad not loaded yet");
      return { success: false, rewarded: false };
    }

    if (!GoogleAdMob.showAppsInTossAdMob.isSupported()) {
      console.warn("[RewardedAd] showAppsInTossAdMob not supported");
      return { success: false, rewarded: false };
    }

    return new Promise((resolve) => {
      let rewarded = false;
      let rewardData: { unitType: string; unitAmount: number } | undefined;

      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: this.adGroupId,
        },
        onEvent: (event) => {
          switch (event.type) {
            case "requested":
              this.status = "idle";
              break;
            case "userEarnedReward":
              rewarded = true;
              rewardData = event.data as {
                unitType: string;
                unitAmount: number;
              };
              break;
            case "dismissed":
              resolve({ success: true, rewarded, reward: rewardData });
              break;
            case "failedToShow":
              resolve({ success: false, rewarded: false });
              break;
          }
        },
        onError: (error) => {
          console.error("[RewardedAd] Show error:", error);
          resolve({ success: false, rewarded: false });
        },
      });
    });
  }

  async loadAndShow(): Promise<{
    success: boolean;
    rewarded: boolean;
    reward?: { unitType: string; unitAmount: number };
  }> {
    const loaded = await this.load();

    if (!loaded) {
      return { success: false, rewarded: false };
    }

    return this.show();
  }

  dispose() {
    this.cleanup?.();
    this.cleanup = null;
    this.status = "idle";
  }
}

export const TEST_AD_IDS = {
  INTERSTITIAL: "ait-ad-test-interstitial-id",
  REWARDED: "ait.v2.live.4a5c7ebb64314d0f",
} as const;

let rewardedAdInstance: RewardedAdManager | null = null;

export function getRewardedAdManager(
  adGroupId: string = TEST_AD_IDS.REWARDED
): RewardedAdManager {
  if (!rewardedAdInstance || rewardedAdInstance["adGroupId"] !== adGroupId) {
    rewardedAdInstance = new RewardedAdManager(adGroupId);
  }
  return rewardedAdInstance;
}
