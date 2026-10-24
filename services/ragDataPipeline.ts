export interface RegulatoryDocument {
  id: string;
  name: string;
  jurisdiction: 'OSHAD' | 'ADNOC' | 'UAE_FEDERAL' | 'MOHRE';
  articleNumber: string;
  contentEng: string;
  contentAr: string;
  effectiveDate: string;
}

export const MOCK_REGULATORY_DB: RegulatoryDocument[] = [
  {
    id: 'oshad-m7',
    name: 'OSHAD-SF Mechanism 7',
    jurisdiction: 'OSHAD',
    articleNumber: '7.1.2',
    contentEng: 'All incidents must be reported immediately and investigated using a Root Cause Analysis methodology. A CAPA plan must be drafted within 48 hours for High Potential incidents.',
    contentAr: 'يجب الإبلاغ عن جميع الحوادث على الفور والتحقيق فيها باستخدام منهجية تحليل السبب الجذري. يجب صياغة خطة العمل التصحيحية والوقائية (CAPA) في غضون 48 ساعة للحوادث ذات الاحتمالية العالية.',
    effectiveDate: '2023-01-01'
  },
  {
    id: 'adnoc-cop-v3',
    name: 'ADNOC Code of Practice',
    jurisdiction: 'ADNOC',
    articleNumber: 'V3-4.5',
    contentEng: 'A Permit to Work (PTW) is strictly required for any confined space entry. The atmospheric testing must be conducted by a certified gas tester.',
    contentAr: 'تصريح العمل (PTW) مطلوب بصرامة لأي دخول إلى مكان محصور. يجب إجراء اختبار الغلاف الجوي بواسطة مختبر غاز معتمد.',
    effectiveDate: '2022-05-15'
  },
  {
    id: 'uae-fed-labour',
    name: 'UAE Federal Labor Law',
    jurisdiction: 'UAE_FEDERAL',
    articleNumber: 'Article 14',
    contentEng: 'Employers must provide workers with adequate protection against hazards of occupational injuries and diseases that may occur during work.',
    contentAr: 'يجب على أصحاب العمل تزويد العمال بالحماية الكافية ضد مخاطر الإصابات والأمراض المهنية التي قد تحدث أثناء العمل.',
    effectiveDate: '2022-02-02'
  }
];

export class RAGDataPipeline {
  static async searchDomainKnowledge(query: string, lang: 'en' | 'ar'): Promise<RegulatoryDocument[]> {
    console.log(`[RAG Data Pipeline] Simulating semantic vector search for query: "${query}" in ${lang}`);
    // Simulate latency
    await new Promise(res => setTimeout(res, 800));
    
    // Simple keyword matching for simulation
    const keywords = query.toLowerCase().split(' ');
    
    const results = MOCK_REGULATORY_DB.filter(doc => {
      const content = lang === 'en' ? doc.contentEng.toLowerCase() : doc.contentAr.toLowerCase();
      return keywords.some(k => content.includes(k) || doc.jurisdiction.toLowerCase().includes(k) || doc.name.toLowerCase().includes(k));
    });

    // If no exact keyword match, return a relevant one for demonstration
    return results.length > 0 ? results : [MOCK_REGULATORY_DB[0]];
  }

  static logQueryAudit(query: string, response: string, sources: string[]) {
    console.log(`[Audit Log] Query: ${query}`);
    console.log(`[Audit Log] Sources Cited: ${sources.join(', ')}`);
  }
}
