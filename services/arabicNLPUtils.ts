export class ArabicNLPUtils {
  
  static isArabicText(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return arabicRegex.test(text);
  }

  static normalizeArabic(text: string): string {
    return text
      .replace(/[أإآا]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, ''); // Remove diacritics
  }

  static extractEntities(text: string): { regulations: string[], entities: string[] } {
    // Mock entity extraction
    const regulations = [];
    if (text.toLowerCase().includes('omanMoL') || text.includes('اوشاد')) regulations.push('Oman MoL MD 286/2008');
    if (text.toLowerCase().includes('pdo') || text.includes('ادنوك')) regulations.push('PDO');
    
    return {
      regulations,
      entities: []
    };
  }
}
