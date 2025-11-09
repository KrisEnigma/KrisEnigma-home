(async () => {
  const res = await fetch('http://localhost:4321/');
  const html = await res.text();
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
  console.log('found', scripts.length, 'scripts');
  const idx = 4 - 1; // zero-based
  if (scripts[idx]) {
    const attrs = scripts[idx][1];
    const content = scripts[idx][2];
    console.log('attrs:', attrs);
    console.log('length:', content.length);
    console.log('---first 300 chars---');
    console.log(content.slice(0, 300));
    console.log('---chars with codes---');
    for (let i = 0; i < Math.min(content.length, 200); i++) {
      const ch = content[i];
      process.stdout.write(`${i}:${ch}(${ch ? ch.charCodeAt(0) : 'NA'}) `);
    }
    console.log('\n---end---');
  } else {
    console.log('no script #4');
  }
})();
