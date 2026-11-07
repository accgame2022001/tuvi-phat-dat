window.BeerFX = (function(){
  function rr(g, x, y, w, h, r){
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function coin(g, x, y, s, opt = {}){
    const { tilt = 0, spin = 0, yang = true, alpha = 1 } = opt;
    if (s <= 0 || alpha <= 0) return;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    const scaleY = Math.max(.18, Math.abs(Math.cos(spin)));
    g.scale(s, s * scaleY);
    g.globalAlpha *= alpha;

    const r = 34;
    const grd = g.createRadialGradient(-8, -10, 4, 0, 0, r);
    if (yang) {
      grd.addColorStop(0, '#fff3b8');
      grd.addColorStop(.45, '#f6c445');
      grd.addColorStop(.82, '#c88719');
      grd.addColorStop(1, '#7d4b06');
    } else {
      grd.addColorStop(0, '#ffe39e');
      grd.addColorStop(.45, '#d69b2a');
      grd.addColorStop(.82, '#8f5b10');
      grd.addColorStop(1, '#4f2e04');
    }
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, r, 0, 6.2832);
    g.fill();

    g.lineWidth = 3.2;
    g.strokeStyle = '#ffea9f';
    g.beginPath();
    g.arc(0, 0, r - 2.5, 0, 6.2832);
    g.stroke();

    g.lineWidth = 1.6;
    g.strokeStyle = '#754608';
    g.beginPath();
    g.arc(0, 0, r - 7, 0, 6.2832);
    g.stroke();

    const sq = 9.5;
    g.fillStyle = '#241205';
    rr(g, -sq, -sq, sq * 2, sq * 2, 2);
    g.fill();
    g.strokeStyle = '#ffd875';
    g.lineWidth = 2;
    g.stroke();

    g.fillStyle = yang ? '#6b3b05' : '#3d2003';
    g.font = '800 9px serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (yang) {
      g.fillText('乾', 0, -20);
      g.fillText('隆', 0, 20);
      g.fillText('通', -20, 0);
      g.fillText('寶', 20, 0);
    } else {
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        g.beginPath();
        g.arc(Math.cos(a) * 19, Math.sin(a) * 19, 3, 0, 6.2832);
        g.fill();
      }
    }
    g.restore();
  }

  function stick(g, x, y, s, opt = {}){
    const { tilt = .15, alpha = 1 } = opt;
    if (s <= 0 || alpha <= 0) return;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    g.scale(s, s);
    g.globalAlpha *= alpha;

    const grd = g.createLinearGradient(-7, -55, 7, 35);
    grd.addColorStop(0, '#ffe39c');
    grd.addColorStop(.5, '#e0a94b');
    grd.addColorStop(1, '#a86e1c');
    g.fillStyle = grd;
    rr(g, -7, -56, 14, 92, 5);
    g.fill();

    g.fillStyle = '#c92a2a';
    rr(g, -7, -56, 14, 22, 4);
    g.fill();

    g.fillStyle = '#ffd97d';
    g.font = '800 10px serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('上', 0, -20);
    g.fillText('上', 0, -6);
    g.fillText('籤', 0, 8);
    g.restore();
  }

  function ingot(g, x, y, s, opt = {}){
    const { tilt = 0, alpha = 1 } = opt;
    if (s <= 0 || alpha <= 0) return;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    g.scale(s, s);
    g.globalAlpha *= alpha;

    g.fillStyle = '#ffe58f';
    g.beginPath();
    g.ellipse(0, -10, 22, 12, 0, 0, 6.2832);
    g.fill();

    const grd = g.createLinearGradient(-34, -14, 34, 18);
    grd.addColorStop(0, '#fff0ad');
    grd.addColorStop(.45, '#f7be38');
    grd.addColorStop(1, '#b57409');
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(-34, -8);
    g.quadraticCurveTo(-18, -24, 0, -10);
    g.quadraticCurveTo(18, -24, 34, -8);
    g.quadraticCurveTo(26, 18, 0, 18);
    g.quadraticCurveTo(-26, 18, -34, -8);
    g.closePath();
    g.fill();
    g.lineWidth = 2;
    g.strokeStyle = '#fff5c0';
    g.stroke();
    g.restore();
  }

  function lotus(g, x, y, s, opt = {}){
    const { tilt = 0, alpha = 1 } = opt;
    if (s <= 0 || alpha <= 0) return;
    g.save();
    g.translate(x, y);
    g.rotate(tilt);
    g.scale(s, s);
    g.globalAlpha *= alpha;

    for (const a of [-0.7, -0.35, 0, 0.35, 0.7]) {
      g.save();
      g.rotate(a);
      const grd = g.createLinearGradient(0, -28, 0, 6);
      grd.addColorStop(0, '#ffd6e7');
      grd.addColorStop(.55, '#ff85b3');
      grd.addColorStop(1, '#c93b72');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(0, -28);
      g.quadraticCurveTo(13, -10, 0, 6);
      g.quadraticCurveTo(-13, -10, 0, -28);
      g.fill();
      g.restore();
    }
    g.fillStyle = '#ffd966';
    g.beginPath();
    g.ellipse(0, 2, 10, 5, 0, 0, 6.2832);
    g.fill();
    g.restore();
  }

  function yinyang(g, x, y, r, rot = 0, alpha = 1){
    if (r <= 0 || alpha <= 0) return;
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.globalAlpha *= alpha;

    g.fillStyle = '#fff5dc';
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#1d120c';
    g.beginPath();
    g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
    g.arc(0, r / 2, r / 2, Math.PI / 2, -Math.PI / 2, true);
    g.arc(0, -r / 2, r / 2, Math.PI / 2, -Math.PI / 2, false);
    g.closePath();
    g.fill();

    g.fillStyle = '#1d120c';
    g.beginPath();
    g.arc(0, -r / 2, r * 0.16, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#fff5dc';
    g.beginPath();
    g.arc(0, r / 2, r * 0.16, 0, Math.PI * 2);
    g.fill();

    g.lineWidth = Math.max(1.5, r * 0.06);
    g.strokeStyle = '#f5c249';
    g.beginPath();
    g.arc(0, 0, r, 0, Math.PI * 2);
    g.stroke();
    g.restore();
  }

  function mug(g, x, y, s, opt = {}){
    ingot(g, x, y, s * 1.15, opt);
  }
  function foam(g, x, y, s, alpha = 1){
    lotus(g, x, y, s, { alpha });
  }
  function hop(g, x, y, s, rot = 0, alpha = 1){
    coin(g, x, y, s * 0.65, { tilt: rot, spin: rot * 1.5, yang: true, alpha });
  }
  function dice(g, x, y, s, value = 1, rot = 0, alpha = 1){
    coin(g, x, y, s * 0.85, { tilt: rot, spin: 0, yang: value % 2 === 1, alpha });
  }

  return { coin, stick, ingot, lotus, yinyang, mug, foam, hop, dice, roundRect: rr };
})();
