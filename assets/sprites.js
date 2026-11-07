window.BeerSprites = (function(){
  const FILES = {
    master_idle: 'master_idle.webp',
    master_shake: 'master_shake.webp',
    master_cast: 'master_cast.webp',
    master_read: 'master_read.webp',
    man: 'guest_man.webp',
    woman: 'guest_woman.webp',
    uncle: 'guest_uncle.webp',
    oldwoman: 'guest_oldwoman.webp',
    cap: 'guest_cap.webp',
    sexy: 'guest_sexy.webp',
    walk_man: 'walk_man.webp',
    walk_woman: 'walk_woman.webp',
    walk_uncle: 'walk_uncle.webp',
    walk_oldwoman: 'walk_oldwoman.webp',
    walk_cap: 'walk_cap.webp',
    walk_sexy: 'walk_sexy.webp',
  };
  function loadImage(src){
    const im = new Image();
    im.decoding = 'async';
    im.src = src;
    return im;
  }
  function create(base = 'assets/'){
    const parts = new Map();
    const waiting = [];
    let done = false;
    function finish(){
      if (done) return;
      done = true;
      for (const fn of waiting.splice(0)) fn();
    }
    function fallback(){
      const keys = Object.keys(FILES);
      let left = keys.length;
      const step = () => { if (--left === 0) finish(); };
      for (const k of keys){
        const im = loadImage(base + FILES[k]);
        im.onload = () => { parts.set(k, { im }); step(); };
        im.onerror = () => { step(); };
      }
    }
    fetch(base + 'atlas.json')
      .then(r => { if (!r.ok) throw new Error('atlas ' + r.status); return r.json(); })
      .then(meta => {
        if (!meta || !meta.sprites) throw new Error('atlas json');
        const im = loadImage(base + meta.image);
        im.onload = () => {
          for (const k of Object.keys(FILES)){ const r = meta.sprites[k]; if (r) parts.set(k, { im, sx:r.x, sy:r.y, sw:r.w, sh:r.h }); }
          finish();
        };
        im.onerror = () => fallback();
      })
      .catch(() => fallback());

    function has(key){ const p = parts.get(key); return !!p && p.im.naturalWidth > 0; }
    function draw(c, key, x, y, s, anchorY = 1){
      const p = parts.get(key);
      if (!p || !p.im.naturalWidth) return false;
      const sw = p.sw || p.im.naturalWidth, sh = p.sh || p.im.naturalHeight;
      const w = sw * s, h = sh * s;
      if (p.sw) c.drawImage(p.im, p.sx, p.sy, sw, sh, x - w/2, y - h*anchorY, w, h);
      else c.drawImage(p.im, x - w/2, y - h*anchorY, w, h);
      return true;
    }
    function natural(key){ const p = parts.get(key); return p ? (p.sw || p.im.naturalWidth) : 0; }
    function dim(key){
      const p = parts.get(key);
      return p ? { w: p.sw || p.im.naturalWidth, h: p.sh || p.im.naturalHeight } : { w: 0, h: 0 };
    }
    function onReady(fn){ if (done) fn(); else waiting.push(fn); }
    return { has, draw, natural, dim, onReady };
  }
  return { create };
})();
