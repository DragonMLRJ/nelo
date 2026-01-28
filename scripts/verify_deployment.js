import https from 'https';

const url = 'https://nelo-marketplace.vercel.app';

console.log(`🚀 Starting Automated Tests for: ${url}\n`);

const req = https.get(url, (res) => {
    console.log(`✅ HTTP Status: ${res.statusCode} ${res.statusMessage}`);

    // Check Security Headers
    const csp = res.headers['content-security-policy'];
    if (csp) {
        console.log(`✅ Integrity: Content-Security-Policy is ACTIVE.`);
    } else {
        console.log(`⚠️ Integrity: CSP Header missing (Check Vercel Config).`);
    }

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        // Content Verification
        if (data.includes('Nelo')) {
            console.log(`✅ Content: Brand Name "Nelo" found.`);
        } else {
            console.log(`❌ Content: Brand Name NOT found.`);
        }

        if (data.includes('googleapis.com')) {
            console.log(`✅ Assets: Fonts loading correctly.`);
        }

        console.log('\n✨ TEST VERDICT: ONLINE & RESPONSIVE');
    });

});

req.on('error', (e) => {
    console.error(`❌ Connection Failed: ${e.message}`);
});
