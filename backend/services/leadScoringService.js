/**
 * Lead Quality Scoring Engine
 * Evaluates verified lead metrics and calculates a score (0 to 100).
 * Classifies lead as Hot (>= 80), Warm (50-79), or Cold (< 50).
 */
class LeadScoringService {
  static calculateScoreAndQuality(lead) {
    let score = 30; // Base score for verified contact

    // 1. Moving Date Urgency
    if (lead.moving_date) {
      const today = new Date();
      const movingDate = new Date(lead.moving_date);
      const diffTime = movingDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        score += 35; // Immediate urgency (Hot demand)
      } else if (diffDays > 7 && diffDays <= 15) {
        score += 20; // Medium urgency
      } else if (diffDays > 15 && diffDays <= 30) {
        score += 10;
      } else {
        score += 5;
      }
    }

    // 2. Requirements Completeness
    if (lead.additional_requirements && lead.additional_requirements.trim().length > 10) {
      score += 15; // User provided specific move details
    }

    // 3. Inter-city relocation (Higher booking value & intent)
    if (
      lead.pickup_city &&
      lead.destination_city &&
      lead.pickup_city.trim().toLowerCase() !== lead.destination_city.trim().toLowerCase()
    ) {
      score += 10;
    } else {
      score += 5;
    }

    // 4. Email Quality (Corporate / valid email domain)
    if (lead.email && !lead.email.includes('test') && !lead.email.includes('fake')) {
      score += 10;
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score));

    // Quality Classification
    let quality = 'Cold';
    if (score >= 80) {
      quality = 'Hot';
    } else if (score >= 50) {
      quality = 'Warm';
    }

    return { score, quality };
  }
}

module.exports = LeadScoringService;
