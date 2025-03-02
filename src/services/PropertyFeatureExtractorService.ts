class PropertyFeatureExtractorService {
  extractFeatures(text: string): string[] {
    console.log("Extracting features from text");
    const features: string[] = [];
    // Ursprüngliche Feature-Extraktion (z.B. bedroom, bathrooms, location)
    const regex1 = /(\d+\s*bedroom|\d+\s*bathrooms|located in \w+)/gi;
    const matches1 = text.match(regex1);
    if (matches1) {
      features.push(...matches1);
    }
    // Erweiterung: Zusätzliche Extraktion nach sqft, Preis oder Garage-Information
    const regex2 = /(\d+\s*sqft|price:\s*\$\d+|garage)/gi;
    const matches2 = text.match(regex2);
    if (matches2) {
      features.push(...matches2);
    }
    return features;
  }
}

const propertyFeatureExtractor = new PropertyFeatureExtractorService();
export default propertyFeatureExtractor;
