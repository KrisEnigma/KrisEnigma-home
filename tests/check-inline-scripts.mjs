(async () => {
    const res = await fetch('http://localhost:4321/');
    const html = await res.text();
    const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let m;
    let i = 0;
    const results = [];
    while ((m = scriptRegex.exec(html)) !== null) {
        const attrs = m[1];
        const content = m[2];
        // skip scripts with src attribute
        if (/\ssrc=/.test(attrs)) continue;
        // skip application/ld+json
        if (/type=\"application\/ld\+json\"/.test(attrs)) continue;
        i++;
        try {
            // try to compile the script
            new Function(content);
            console.log(`Script #${i}: OK (length ${content.length}) attrs=${attrs.replace(/\n/g, ' ')}`);
        } catch (err) {
            console.error(`Script #${i}: SYNTAX ERROR:`, err.message, 'attrs=', attrs.replace(/\n/g, ' '));
            console.error(err.stack);
            console.error('---- snippet ----');
            console.error(content.slice(0, 1000));
            console.error('---- end snippet ----');
            results.push({ index: i, error: err.message, snippet: content.slice(0, 2000) });

            // Try to locate the earliest position causing the syntax error via binary search
            try {
                let lo = 0;
                let hi = content.length;
                while (hi - lo > 1) {
                    const mid = Math.floor((lo + hi) / 2);
                    try {
                        new Function(content.slice(0, mid));
                        lo = mid;
                    } catch (e) {
                        hi = mid;
                    }
                }
                const pos = hi;
                console.error('Approx error position:', pos);
                console.error('Context around error:\n', content.slice(Math.max(0, pos - 80), pos + 80));
            } catch (e) {
                // ignore
            }
        }
    }
    if (results.length === 0) {
        console.log('No syntax errors detected in inline scripts.');
    } else {
        console.log('Found', results.length, 'script(s) with syntax errors.');
    }
})();
