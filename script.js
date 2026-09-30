const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Waitlist: submit to Formspree without leaving the page.
// Without JS, the form's action/method still posts to Formspree directly.
const form = document.getElementById('signup');
const note = document.getElementById('signup-note');
const button = form && form.querySelector('button');
const buttonLabel = button && button.textContent;

if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();
  button.disabled = true;
  button.textContent = 'Sending…';
  note.textContent = '';
  form.email.removeAttribute('aria-invalid');

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      form.reset();
      note.textContent = "Thanks. You're on the list.";
    } else {
      const data = await res.json().catch(() => ({}));
      const errors = data.errors || [];
      if (errors.some((err) => err.field === 'email')) form.email.setAttribute('aria-invalid', 'true');
      note.textContent = errors.map((err) => err.message).join(' ') || 'Something went wrong. Please try again.';
    }
  } catch {
    note.textContent = 'Network error. Please try again.';
  } finally {
    button.disabled = false;
    button.textContent = buttonLabel;
  }
});

// ---------- Motion ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Hero headline: wrap each line so it can rise from behind a mask.
document.querySelectorAll('.hero__title').forEach((title) => {
  title.innerHTML = title.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line) => `<span class="line"><span>${line.trim()}</span></span>`)
    .join('');
});
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-ready')));

// Scroll reveals, staggered within each group.
const revealGroups = [
  '.section .label', '.section h2', '.statement',
  '.rows li', '.cols > div', '.footnote', '.steps li', '.said__row',
  '.table__row', '.table__note', '.split__art',
  '.paper .label', '.paper__title', '.rules p', '.plan',
  '.access__art', '.access h2', '.access .lead', '.access .signup',
];
const revealEls = [];
revealGroups.forEach((selector) => {
  const byParent = new Map();
  document.querySelectorAll(selector).forEach((el) => {
    if (el.closest('.hero')) return;
    const i = byParent.get(el.parentElement) || 0;
    byParent.set(el.parentElement, i + 1);
    el.dataset.reveal = '';
    el.style.setProperty('--i', i);
    revealEls.push(el);
  });
});
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  revealEls.forEach((el) => io.observe(el));
}

// Mouse parallax for the background logo and the penguin.
if (finePointer && !reduceMotion) {
  const mark = document.querySelector('.hero__mark');
  const art = document.querySelectorAll('.split__art img, .access__art');
  window.addEventListener('pointermove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    if (mark) { mark.style.setProperty('--mx', `${x * -30}px`); mark.style.setProperty('--my', `${y * -30}px`); }
    art.forEach((img) => { img.style.setProperty('--px', `${x * 14}px`); img.style.setProperty('--py', `${y * 14}px`); });
  }, { passive: true });
}

// Fluid background: a slow, monochrome liquid rendered with WebGL.
(function fluid() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__fluid';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  hero.prepend(canvas);

  const vert = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const frag = `
    precision mediump float;
    uniform vec2 res; uniform float t; uniform vec2 mouse;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0., a = .5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= .5; }
      return v;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / res.y;
      vec2 mo = (mouse - .5) * vec2(res.x / res.y, 1.);
      float s = t * .04;
      vec2 q = vec2(fbm(uv * 1.4 + s), fbm(uv * 1.4 - s + 5.2));
      vec2 r = vec2(fbm(uv * 1.4 + 3. * q + vec2(1.7, 9.2) + mo * .35 + s * 1.5),
                    fbm(uv * 1.4 + 3. * q + vec2(8.3, 2.8) - s));
      float f = fbm(uv * 1.4 + 3. * r);
      float silk = smoothstep(.55, .95, f) * .55 + pow(f, 3.) * .35;
      silk += smoothstep(.02, 0., abs(f - .62)) * .12;
      vec3 col = vec3(silk) * vec3(.9, .95, 1.);
      gl_FragColor = vec4(col * .34, 1.);
    }`;

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'res');
  const uT = gl.getUniformLocation(prog, 't');
  const uMouse = gl.getUniformLocation(prog, 'mouse');

  // Render at reduced resolution: the effect is soft, so this is invisible and cheap.
  const scale = 0.5;
  const resize = () => {
    canvas.width = Math.max(1, Math.round(hero.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(hero.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  if (finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const b = hero.getBoundingClientRect();
      mouse.tx = (e.clientX - b.left) / b.width;
      mouse.ty = 1 - (e.clientY - b.top) / b.height;
    }, { passive: true });
  }

  let visible = true;
  let raf = 0;
  const start = performance.now();
  const draw = (now) => {
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    gl.uniform1f(uT, (now - start) / 1000 + 20);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
  const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden && !reduceMotion) raf = requestAnimationFrame(loop); };

  draw(start);
  canvas.classList.add('is-on');
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
  run();
})();
