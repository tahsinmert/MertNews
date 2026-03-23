/**
 * Advanced Server-side Translation Helper
 * Uses a reliable, fast, and free translation mechanism.
 */
export async function translateText(text, targetLang) {
    if (!text || text.length < 3) return text;
    
    // We assume the source is Turkish if target is EN, and English if target is TR
    const sourceLang = targetLang === 'en' ? 'tr' : 'en';
    
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Translation failed:', response.statusText);
            return text;
        }

        const data = await response.json();
        // Google Translate returns an array of arrays for segments
        if (data && data[0]) {
            return data[0].map(segment => segment[0]).join('');
        }
        
        return text;
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}
