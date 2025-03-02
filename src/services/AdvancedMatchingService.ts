class AdvancedMatchingService {
  matchPropertyWithInvestors(property: any, investorProfiles: any[]): any[] {
    console.log("Matching property:", property, "with investor profiles", investorProfiles);
    return investorProfiles
      .map((investor) => {
        let score = 0;
        if (
          investor.criteria &&
          property.type &&
          investor.criteria.toLowerCase().includes(property.type.toLowerCase())
        ) {
          score += 50;
        }
        // Zusätzliche Zufallsbewertung simulieren
        score += Math.floor(Math.random() * 50);
        return { investor, score };
      })
      .filter((match) => match.score > 50)
      .sort((a, b) => b.score - a.score);
  }

  // Erweiterung: Matching unter Einbezug mehrerer Kriterien und Keywords in der Beschreibung
  matchByMultipleCriteria(property: any, investorProfiles: any[]): any[] {
    console.log("Performing multi-criteria matching for property:", property);
    const matches = investorProfiles.map((investor) => {
      let score = 0;
      // Basis-Abgleich wie in der originalen Methode
      if (
        investor.criteria &&
        property.type &&
        investor.criteria.toLowerCase().includes(property.type.toLowerCase())
      ) {
        score += 50;
      }
      // Zusätzlicher Vergleich anhand von Schlüsselwörtern aus der Beschreibung
      if (property.description && investor.criteria) {
        const keywords = investor.criteria.split(",").map((k: string) => k.trim().toLowerCase());
        keywords.forEach((keyword) => {
          if (property.description.toLowerCase().includes(keyword)) {
            score += 10;
          }
        });
      }
      // Weitere zufällige Punktzahl als Bonus
      score += Math.floor(Math.random() * 30);
      return { investor, score };
    })
    .filter((match) => match.score > 60)
    .sort((a, b) => b.score - a.score);

    return matches;
  }
}

const advancedMatchingService = new AdvancedMatchingService();
export default advancedMatchingService;
