(async () => {
    const res = await fetch('http://localhost:4321/');
    const html = await res.text();
    const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    let count = 0;
    let target = null;
    while ((m = scriptRegex.exec(html))) {
        const attrs = m[1];
        const content = m[2];
        if (/\ssrc=/.test(attrs)) continue;
        count++;
        if (content.includes('Solo cargar si no existe ya') || content.includes('krisContactModalLoaded')) {
            target = content;
            console.log('Found contact inline script as non-src inline script number', count, 'length', content.length);
            break;
        }
    }
    if (!target) return console.log('Contact inline script not found');

    // Quick compile check
    try {
        new Function(target);
        console.log('Full script compiles OK in Node V8 engine');
    } catch (e) {
        console.error('Full script compile failed:', e.message);
    }

    // Binary search for first index that causes failure
    let lo = 1;
    let hi = target.length;
    let failPos = null;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        try {
            new Function(target.slice(0, mid));
            // prefix OK -> move right
            lo = mid + 1;
        } catch (err) {
            // prefix fails -> move left
            failPos = mid;
            hi = mid - 1;
        }
    }
    console.log('Approx first failing position:', failPos);
    console.log('Context around fail:');
    const start = Math.max(0, (failPos || 0) - 80);
    const end = Math.min(target.length, (failPos || 0) + 80);
    const ctx = target.slice(start, end);
    console.log('---- context ----\n', ctx.replace(/\n/g, '\\n'));
    console.log('---- codes ----');
    for (let i = start; i < end; i++) {
        const ch = target[i];
        process.stdout.write(`${i}:${ch ? ch.charCodeAt(0) : 'NA'} `);
    }
    console.log('\n---- end ----');
})();
