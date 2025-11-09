import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    let allPassed = true;
    const base = process.env.SITE_URL || 'https://krisenigma.com';

        // Instrumentación: capturar logs y errores de la página y requests fallidos
        page.on('console', msg => {
            const loc = msg.location ? msg.location() : undefined;
            console.log('[PAGE LOG]', msg.text(), loc ? JSON.stringify(loc) : '');
        });
    page.on('pageerror', err => console.log('[PAGE ERROR]', err.message, '\n', err.stack));
        page.on('requestfailed', req => console.log('[REQUEST FAILED]', req.url(), req.failure && req.failure().errorText));
        page.on('response', resp => console.log('[PAGE RESP]', resp.status(), resp.url()));

    try {
        console.log('Test 1: Simular bot (honeypot) - base URL:', base);
        await page.goto(base, { waitUntil: 'load' });

        // Open modal and wait until it's visible (no pointer-events-none)
        await page.evaluate(() => { if ((window).openContact) (window).openContact(); });
        await page.waitForFunction(() => {
            const m = document.getElementById('contactModal');
            return m && !m.classList.contains('pointer-events-none');
        }, { timeout: 5000 }).catch(() => {});

        // Fill fields
        await page.fill('input[name="name"]', 'Bot');
        await page.fill('input[name="email"]', 'bot@mail.test');
        await page.selectOption('select[name="subject"]', 'Preguntas').catch(() => {});
        await page.fill('textarea[name="message"]', 'spammy');
        // Set the hidden honeypot field value right before submit to simulate a bot filling it
        await page.evaluate(() => {
            const el = document.querySelector('input[name="urltrap"]');
            if (el) el.value = 'bot';
        });

            // Dispatch submit event directly on the form to trigger the JS handler
            await page.evaluate(() => {
                const form = document.getElementById('contactForm');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            });

            // Wait for the backend response to the worker and log it
            const resp1 = await page.waitForResponse(resp => resp.url().includes('mailer.krisenigma.workers.dev'), { timeout: 10000 }).catch(() => null);
            const body1 = resp1 ? await resp1.json().catch(() => null) : null;
            console.log('Worker response for test1:', resp1 ? resp1.status() : 'no-response', body1);
            if (!body1 || !body1.error || !/spam detectado/i.test(body1.error)) {
                console.error('Test 1 FAILED: expected worker to return spam detection');
                allPassed = false;
            } else {
                console.log('Test 1 passed (worker blocked)');
            }
    } catch (err) {
        console.error('Test 1 error', err);
        allPassed = false;
    }

    try {
        console.log('\nTest 2: Envío válido (espera 4s)');
        await page.reload({ waitUntil: 'load' });

        await page.evaluate(() => { if ((window).openContact) (window).openContact(); });
        await page.waitForFunction(() => {
            const m = document.getElementById('contactModal');
            return m && !m.classList.contains('pointer-events-none');
        }, { timeout: 5000 }).catch(() => {});

        await page.fill('input[name="name"]', 'Tester');
        await page.fill('input[name="email"]', 'tester@mail.test');
        await page.selectOption('select[name="subject"]', 'Preguntas').catch(() => {});
        await page.fill('textarea[name="message"]', 'Hola esto es una prueba');
        // Wait to pass time-based anti-spam
        await page.waitForTimeout(4000);

            // Dispatch submit event on the form to trigger handler
            await page.evaluate(() => {
                const form = document.getElementById('contactForm');
                if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            });

            // Wait for backend response
            const resp2 = await page.waitForResponse(resp => resp.url().includes('mailer.krisenigma.workers.dev'), { timeout: 15000 }).catch(() => null);
            const body2 = resp2 ? await resp2.json().catch(() => null) : null;
            console.log('Worker response for test2:', resp2 ? resp2.status() : 'no-response', body2);
            if (!body2 || !body2.success) {
                console.error('Test 2 FAILED: expected worker to send email');
                allPassed = false;
            } else {
                console.log('Test 2 passed (worker sent)');
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
