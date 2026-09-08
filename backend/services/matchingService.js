const { pool } = require('../config/db');

/**
 * Logistics Company Matching Engine
 * Rule-based algorithm to match verified leads with logistics companies based on:
 * 1. Pickup City coverage (40 points)
 * 2. Destination City coverage (40 points)
 * 3. Service Type capability (20 points)
 */
class MatchingService {
  static async findAndSaveMatchingCompanies(leadId) {
    const connection = await pool.getConnection();
    try {
      // 1. Fetch Lead Details
      const [leads] = await connection.query('SELECT * FROM leads WHERE id = ?', [leadId]);
      if (leads.length === 0) {
        throw new Error('Lead not found');
      }
      const lead = leads[0];

      // 2. Fetch Active Logistics Companies
      const [companies] = await connection.query("SELECT * FROM companies WHERE status = 'Active'");

      const matchedCompanies = [];

      for (const company of companies) {
        const coverageCities = typeof company.coverage_cities === 'string'
          ? JSON.parse(company.coverage_cities)
          : company.coverage_cities || [];
        
        const serviceTypes = typeof company.service_types === 'string'
          ? JSON.parse(company.service_types)
          : company.service_types || [];

        let matchScore = 0;

        // Pickup City Match (40 pts)
        const coversPickup = coverageCities.some(
          c => c.toLowerCase() === lead.pickup_city.trim().toLowerCase()
        );
        if (coversPickup) matchScore += 40;

        // Destination City Match (40 pts)
        const coversDestination = coverageCities.some(
          c => c.toLowerCase() === lead.destination_city.trim().toLowerCase()
        );
        if (coversDestination) matchScore += 40;

        // Service Type Match (20 pts)
        const supportsService = serviceTypes.some(
          s => s.toLowerCase() === lead.service_type.trim().toLowerCase()
        );
        if (supportsService) matchScore += 20;

        // Include company if it meets at least one city or service criteria
        if (matchScore >= 40) {
          matchedCompanies.push({
            company_id: company.id,
            company_name: company.company_name,
            rating: company.rating,
            contact_phone: company.contact_phone,
            email: company.email,
            coverage_cities: coverageCities,
            service_types: serviceTypes,
            match_score: matchScore,
            coversPickup,
            coversDestination,
            supportsService
          });
        }
      }

      // Sort by Match Score DESC, then Company Rating DESC
      matchedCompanies.sort((a, b) => b.match_score - a.match_score || b.rating - a.rating);

      // 3. Clear existing matches for this lead & save top matches to DB
      await connection.query('DELETE FROM lead_company_matches WHERE lead_id = ?', [leadId]);

      for (const comp of matchedCompanies) {
        await connection.query(
          `INSERT INTO lead_company_matches (lead_id, company_id, match_score, notification_status) 
           VALUES (?, ?, ?, 'Pending')`,
          [leadId, comp.company_id, comp.match_score]
        );
      }

      return matchedCompanies;
    } finally {
      connection.release();
    }
  }

  static async getMatchesForLead(leadId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT lcm.id as match_id, lcm.match_score, lcm.notification_status, lcm.created_at as matched_at,
                c.id as company_id, c.company_name, c.coverage_cities, c.service_types, c.rating, c.contact_phone, c.email
         FROM lead_company_matches lcm
         JOIN companies c ON lcm.company_id = c.id
         WHERE lcm.lead_id = ?
         ORDER BY lcm.match_score DESC, c.rating DESC`,
        [leadId]
      );

      return rows.map(r => ({
        ...r,
        coverage_cities: typeof r.coverage_cities === 'string' ? JSON.parse(r.coverage_cities) : r.coverage_cities,
        service_types: typeof r.service_types === 'string' ? JSON.parse(r.service_types) : r.service_types
      }));
    } finally {
      connection.release();
    }
  }
}

module.exports = MatchingService;
