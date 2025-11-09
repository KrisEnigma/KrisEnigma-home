const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    let allPassed = true;

    try {
        console.log('Test 1: Simular bot (honeypot)')
        await page.goto('https://krisenigma.com', { waitUntil: 'load' });
        // Inject honeypot value
        await page.evaluate(() => {
            const el = document.querySelector('input[name="urltrap"]');
            if (el) el.value = 'bot';
        });
        // Open modal and submit quickly
        await page.evaluate(() => {
            if ((window).openContact) (window).openContact();
        });
        await page.fill('input[name="name"]', 'Bot');
        await page.fill('input[name="email"]', 'bot@mail.test');
        await page.selectOption('select[name="subject"]', 'Preguntas').catch(() => { });
        await page.fill('textarea[name="message"]', 'spammy');
        await page.click('button[type="submit"]');
        await page.waitForSelector('#thankyouMessage');
        const text1 = await page.textContent('#thankyouMessage');
        console.log('Result 1 message:', text1.trim());
        if (!/spam detectado|Spam detectado/i.test(text1)) {
            console.error('Test 1 FAILED: expected spam to be detected');
            allPassed = false;
        } else {
            console.log('Test 1 passed');
        }
    } catch (err) {
        console.error('Test 1 error', err);
        allPassed = false;
    }

    try {
        console.log('\nTest 2: Envío válido (espera 4s)')
        await page.reload({ waitUntil: 'load' });
        // Open modal
        await page.evaluate(() => {
            if ((window).openContact) (window).openContact();
        });
        await page.fill('input[name="name"]', 'Tester');
        await page.fill('input[name="email"]', 'tester@mail.test');
        await page.selectOption('select[name="subject"]', 'Preguntas').catch(() => { });
        await page.fill('textarea[name="message"]', 'Hola esto es una prueba');
        // Wait to pass time-based anti-spam
        await page.waitForTimeout(4000);
        await page.click('button[type="submit"]');
        await page.waitForSelector('#thankyouMessage');
        const text2 = await page.textContent('#thankyouMessage');
        console.log('Result 2 message:', text2.trim());
        if (!/Gracias por tu mensaje|¡Gracias por tu mensaje!/i.test(text2)) {
            console.error('Test 2 FAILED: expected success message');
            allPassed = false;
        } else {
            console.log('Test 2 passed');
        }
    } catch (err) {
        console.error('Test 2 error', err);
        allPassed = false;
    }

    await browser.close();
    if (!allPassed) {
        console.error('\nOne or more tests FAILED');
        process.exit(1);
    }
    console.log('\nAll tests passed');
    process.exit(0);
})();
