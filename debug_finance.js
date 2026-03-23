import { XMLParser } from 'fast-xml-parser';

async function debugFetch() {
    try {
        console.log('--- Debugging TCMB Fetch ---');
        const tcmbResponse = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
        console.log('TCMB Status:', tcmbResponse.status);
        const xmlData = await tcmbResponse.text();
        console.log('XML Snippet:', xmlData.substring(0, 200));

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);
        console.log('Root Keys:', Object.keys(jsonObj));
        
        if (jsonObj.Tarih_Date) {
            console.log('Tarih_Date Keys:', Object.keys(jsonObj.Tarih_Date));
            if (jsonObj.Tarih_Date.Currency) {
                console.log('Currency Count:', jsonObj.Tarih_Date.Currency.length);
            } else {
                console.log('Currency key not found in Tarih_Date');
            }
        } else {
            console.log('Tarih_Date key not found');
        }

        console.log('\n--- Debugging CoinGecko Fetch ---');
        const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=usd,try&include_24hr_change=true');
        console.log('Crypto Status:', cryptoResponse.status);
        const cryptoData = await cryptoResponse.json();
        console.log('Crypto Data Keys:', Object.keys(cryptoData));

    } catch (e) {
        console.error('Debug Fetch Error:', e);
    }
}

debugFetch();
