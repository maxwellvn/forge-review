import App from '@/models/App';
import Review from '@/models/Review';

interface PulseScoreFactors {
  views: number;
  totalReviews: number;
  averageRating: number;
  helpfulVotes: number;
  recentReviews: number; // Reviews in last 7 days
  isVerified: boolean;
}

/**
 * Calculate the Pulse Score for an app
 *
 * Formula:
 * - Views: 0.1 points per view (max 100 points)
 * - Reviews: 15 points per review
 * - Rating: averageRating × 10 (max 50 points)
 * - Helpful votes: 2 points per helpful vote
 * - Recent activity: 5 points per review in last 7 days
 * - Verified bonus: +25 points if verified
 */
export function calculatePulseScore(factors: PulseScoreFactors): number {
  const viewsScore = Math.min(factors.views * 0.1, 100);
  const reviewsScore = factors.totalReviews * 15;
  const ratingScore = factors.averageRating * 10;
  const helpfulScore = factors.helpfulVotes * 2;
  const recentScore = factors.recentReviews * 5;
  const verifiedBonus = factors.isVerified ? 25 : 0;

  const total = viewsScore + reviewsScore + ratingScore + helpfulScore + recentScore + verifiedBonus;

  return Math.round(total);
}

/**
 * Update the Pulse Score for an app
 */
export async function updateAppPulseScore(appId: string): Promise<number> {
  const app = await App.findById(appId);

  if (!app) {
    throw new Error('App not found');
  }

  // Get helpful votes from all reviews for this app
  const reviewStats = await Review.aggregate([
    { $match: { appId: app._id } },
    {
      $group: {
        _id: null,
        totalHelpful: { $sum: '$helpful' },
        recentCount: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const helpfulVotes = reviewStats[0]?.totalHelpful || 0;
  const recentReviews = reviewStats[0]?.recentCount || 0;

  const pulseScore = calculatePulseScore({
    views: app.views || 0,
    totalReviews: app.totalReviews || 0,
    averageRating: app.averageRating || 0,
    helpfulVotes,
    recentReviews,
    isVerified: app.isVerified || false,
  });

  await App.findByIdAndUpdate(appId, { pulseScore });

  return pulseScore;
}
