let cur = '0';
let prev = '';
let op = '';
let justEvaled = false;

/* ── Update the screen ── */
function updateDisplay() {
  const main = document.getElementById('main-line');
  const expr = document.getElementById('expr-line');

  const txt = cur.length > 14 ? parseFloat(cur).toExponential(4) : cur;
  main.textContent = txt;
  main.className =
    'main' +
    (txt.length > 12 ? ' tiny' : txt.length > 9 ? ' shrink' : '');

  expr.textContent = op && prev ? prev + ' ' + op : '';
}

/* ── Math ── */
function compute(a, b, o) {
  if (o === '+') return a + b;
  if (o === '−') return a - b;
  if (o === '×') return a * b;
  if (o === '÷') return b === 0 ? NaN : a / b;
  if (o === '%') return a % b;
  return b;
}

function fmt(n) {
  if (isNaN(n) || !isFinite(n)) return 'ERR';
  return parseFloat(n.toPrecision(12)).toString();
}

/* ── Secret trigger ── */
/* Add as many secret codes as you want in this object.
   Key   = what the user types before pressing =  (no operator needed)
   Value = the URL that opens in a new tab         */

   // type 7032026 then = → opens surprise.html
  // '143': 'https://example.com',  // ← more examples you can uncomment
  // '1337': 'https://example.com',

const SECRET_CODES = {
  '7032026':   '3rdmonths.html',     
  '6272026':  'https://discord.com/channels/1507744407359721603/1520046152916140052',
  '5242026':  'Website.html',

  
};

function checkSecret() {
  /* Trigger fires when the user types a lone number (no operator) and hits = */
  if (cur in SECRET_CODES) {
    window.open(SECRET_CODES[cur], '_blank');
    return true;   // signal: we handled it, skip normal math
  }
  return false;
}

/* ── Handle each button action ── */
function handleAction(action, val) {
  if (action === 'ac') {
    cur = '0';
    prev = '';
    op = '';
    justEvaled = false;

  } else if (action === 'back') {
    if (justEvaled) {
      cur = '0';
      justEvaled = false;
    } else {
      cur = cur.length > 1 ? cur.slice(0, -1) : '0';
    }

  } else if (action === 'num') {
    if (justEvaled) {
      cur = val;
      justEvaled = false;
    } else {
      cur = cur === '0' ? val : cur + val;
    }
    if (cur.length > 16) cur = cur.slice(0, 16);

  } else if (action === 'dot') {
    if (justEvaled) {
      cur = '0.';
      justEvaled = false;
    } else if (!cur.includes('.')) {
      cur += '.';
    }

  } else if (action === 'op') {
    if (op && !justEvaled) {
      const res = compute(parseFloat(prev), parseFloat(cur), op);
      cur = fmt(res);
      prev = '';
    }
    prev = cur;
    op = val;
    cur = '0';
    justEvaled = false;

  } else if (action === 'eq') {
    /* Check secret FIRST — if it fires, skip the math */
    if (checkSecret()) return;

    if (!op || !prev) return;
    const res = compute(parseFloat(prev), parseFloat(cur), op);
    cur = fmt(res);
    justEvaled = true;
    op = '';
    prev = '';
  }

  updateDisplay();
}

/* ── Flash the pressed button visually ── */
function flashButton(btn) {
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 100);
}

/* ── Mouse / touch clicks ── */
document.getElementById('btn-grid').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const { action, val } = btn.dataset;
  handleAction(action, val);
  flashButton(btn);
});

/* ── Keyboard support ── */
document.addEventListener('keydown', e => {
  const map = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%',
    'Enter': 'eq', '=': 'eq',
    'Backspace': 'back', 'Escape': 'ac', '.': 'dot'
  };

  const k = map[e.key];
  if (!k) return;
  e.preventDefault();

  if ('0123456789'.includes(k))  handleAction('num', k);
  else if ('+−×÷%'.includes(k)) handleAction('op', k);
  else                           handleAction(k);

  /* Also flash the matching button on screen */
  const btn = [...document.querySelectorAll('.btn')].find(b => {
    if (k === 'eq')   return b.dataset.action === 'eq';
    if (k === 'back') return b.dataset.action === 'back';
    if (k === 'ac')   return b.dataset.action === 'ac';
    if (k === 'dot')  return b.dataset.action === 'dot';
    return b.dataset.val === k;
  });
  if (btn) flashButton(btn);
});