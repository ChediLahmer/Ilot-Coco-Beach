const { chromium } = require('playwright');
const { spawn } = require('child_process');
(async () => {
  const srv = spawn('npx', ['vite', '--port', '5199', '--host', '127.0.0.1'], {
    cwd: 'C:\\Personal\\ilot-cocobeach', shell: true, stdio: 'pipe'
  });
  await new Promise(r => { srv.stdout.on('data', d => { if (d.toString().includes('localhost')) r(); }); setTimeout(r, 10000); });
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5199', { waitUntil: 'networkidle', timeout: 20000 });
    await p.waitForTimeout(2500);
    const shots = [
      ['p-hero.png', null],
      ['p-about.png', 'about'],
      ['p-menu.png', 'menu'],
      ['p-experience.png', 'experience'],
      ['p-gallery.png', 'gallery'],
      ['p-reservation.png', 'reservation'],
    ];
    for (const [file, id] of shots) {
      if (id) { await p.evaluate(i => document.getElementById(i)?.scrollIntoView(), id); await p.waitForTimeout(600); }
      await p.screenshot({ path: file }); console.log(file);
    }
  } catch(e) { console.error(e.message); }
  await browser.close(); srv.kill(); console.log('Done');
})();
