const workerUrl = 'https://mailer.krisenigma.workers.dev/';

async function post(payload) {
    const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
}

(async () => {
    console.log('Backend test 1: honeypot filled (should be blocked)');
    const payload1 = {
        name: 'Bot',
        email: 'bot@mail.test',
        subject: 'Preguntas',
        message: 'spam',
        urltrap: 'bot'
    };
    const r1 = await post(payload1);
    console.log('Status:', r1.status, 'Body:', r1.json);
    if (r1.json && r1.json.error && r1.json.error.toLowerCase().includes('spam')) {
        console.log('Test 1 passed (blocked)');
    } else {
        console.error('Test 1 FAILED');
    }

    console.log('\nBackend test 2: valid payload with formStart >3s ago (should pass)');
    const payload2 = {
        name: 'Tester',
        email: 'tester@mail.test',
        subject: 'Preguntas',
        message: 'Hola, prueba',
        formStart: String(Date.now() - 5000)
    };
    const r2 = await post(payload2);
    console.log('Status:', r2.status, 'Body:', r2.json);
    if (r2.json && r2.json.success) {
        console.log('Test 2 passed (sent)');
    } else {
        console.error('Test 2 FAILED');
    }
})();
