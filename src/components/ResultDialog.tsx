import { useState, useEffect } from 'react';
import { Animal } from '../App';
import { getRewardedAdManager, TEST_AD_IDS } from '../lib/appsInTossAd';

interface ResultDialogProps {
  loser: Animal;
  emoji: string;
  onRestart: () => void;
}

type AdState = 'idle' | 'loading' | 'showing' | 'success' | 'error';

export function ResultDialog({ loser, emoji, onRestart }: ResultDialogProps) {
  const [adState, setAdState] = useState<AdState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const adManager = getRewardedAdManager(TEST_AD_IDS.REWARDED);
    adManager.load().catch(console.error);
  }, []);

  const handleWatchAd = async () => {
    setAdState('loading');
    setErrorMessage('');

    try {
      const adManager = getRewardedAdManager(TEST_AD_IDS.REWARDED);
      
      const loadResult = await adManager.load();
      if (!loadResult) {
        setAdState('error');
        setErrorMessage('광고를 불러올 수 없습니다');
        return;
      }

      setAdState('showing');
      
      const result = await adManager.show();
      
      if (result.success && result.rewarded) {
        setAdState('success');
        setTimeout(() => {
          onRestart();
        }, 500);
      } else if (result.success) {
        setAdState('error');
        setErrorMessage('광고를 끝까지 시청해주세요');
      } else {
        setAdState('error');
        setErrorMessage('광고 표시에 실패했습니다');
      }
    } catch (error) {
      console.error('Ad error:', error);
      setAdState('error');
      setErrorMessage('광고 처리 중 오류가 발생했습니다');
    }
  };

  const getAdButtonContent = () => {
    switch (adState) {
      case 'loading':
        return (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            광고 로딩 중...
          </>
        );
      case 'showing':
        return (
          <>
            <span className="inline-block animate-pulse mr-2">📺</span>
            광고 시청 중...
          </>
        );
      case 'success':
        return (
          <>
            <span className="mr-2">✅</span>
            완료!
          </>
        );
      case 'error':
        return (
          <>
            <span className="mr-2">📺</span>
            다시 시도하기
          </>
        );
      default:
        return (
          <>
            광고 보고 다시하기 📺
          </>
        );
    }
  };

  const isAdButtonDisabled = adState === 'loading' || adState === 'showing' || adState === 'success';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-scale-in">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">{emoji}</div>
          <h3 className="text-2xl mb-2">꼴찌는...</h3>
          <p className="text-3xl text-blue-500 mb-1">{loser}</p>
          <p className="text-gray-600">{loser}님이 꼴찌예요! 🏃💨</p>
        </div>

        {errorMessage && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleWatchAd}
            disabled={isAdButtonDisabled}
            className={`
              w-full h-14 rounded-xl text-lg transition-colors
              ${isAdButtonDisabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white active:bg-blue-600'
              }
            `}
          >
            {getAdButtonContent()}
          </button>
        </div>

        {adState === 'success' && (
          <div className="mt-4 text-center">
            <p className="text-green-600 text-sm">🎉 광고 시청 완료! 다시 시작합니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}
