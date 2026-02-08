'use client';

/**
 * BookTrackerGenerateButton — primary CTA for generating recommendations.
 *
 * Shows loading state during generation and is disabled while a
 * request is in progress.
 */

import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Interface declarations                                             */
/* ------------------------------------------------------------------ */

interface BookTrackerGenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  isDisabled?: boolean;
  hasExistingRecommendations: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component implementation                                           */
/* ------------------------------------------------------------------ */

export function BookTrackerGenerateButton({
  onClick,
  isGenerating,
  isDisabled = false,
  hasExistingRecommendations,
}: BookTrackerGenerateButtonProps): React.JSX.Element {
  const label = hasExistingRecommendations ? 'Refresh Recommendations' : 'Get AI Recommendations';

  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      disabled={isGenerating || isDisabled}
      className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          {label}
        </>
      )}
    </Button>
  );
}
