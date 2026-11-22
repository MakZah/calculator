const display = document.querySelector('#display');
const expression = document.querySelector('#expression');
let current = '0', previous = null, operator = null, fresh = false;
const symbols = {'+': '+', '-': '−', '*': '×', '/': '÷'};
const buddy = document.querySelector('#buddy');
const speech = document.querySelector('#speech');
let soundOn = true, audioContext, happyTimer;
const phrases = ['Вот это математика!', 'Я всё посчитал. Почти.', 'Цифры, держитесь!', 'Бип-буп, я гений!', 'Ого! Даже я удивлён.'];
function fun(result = false) {
  if (soundOn) {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (Audio) {
        audioContext ||= new Audio();
        if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
        const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
        const now = audioContext.currentTime;
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(result ? 660 : 420 + Math.random() * 180, now);
        oscillator.frequency.exponentialRampToValueAtTime(result ? 990 : 280, now + .09);
        gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.001, now + .1);
        oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + .1);
      }
    } catch (_) { /* Калькулятор работает и без аудио. */ }
  }
  if (result) {
    speech.textContent = current === 'Ошибка' ? 'Ой! На ноль делить нельзя!' : phrases[Math.floor(Math.random() * phrases.length)];
    buddy.classList.add('happy'); clearTimeout(happyTimer);
    happyTimer = setTimeout(() => buddy.classList.remove('happy'), 1800);
  }
}
document.querySelector('#sound-toggle').addEventListener('click', e => {
  soundOn = !soundOn; e.currentTarget.setAttribute('aria-pressed', soundOn);
  e.currentTarget.textContent = soundOn ? '🔊 Звук: вкл' : '🔇 Звук: выкл';
});
document.querySelector('#buddy-toggle').addEventListener('click', e => {
  const playground = document.querySelector('#playground'); playground.hidden = !playground.hidden;
  e.currentTarget.setAttribute('aria-pressed', !playground.hidden);
  e.currentTarget.textContent = playground.hidden ? '👾 Чудик: выкл' : '👾 Чудик: вкл';
});
function render() {
  display.textContent = current.replace('.', ',');
  expression.textContent = previous !== null ? `${previous.replace('.', ',')} ${symbols[operator]}` : '\u00a0';
}
function calculate() {
  if (previous === null || operator === null) return true;
  const a = Number(previous), b = Number(current);
  if (operator === '/' && b === 0) { current = 'Ошибка'; previous = operator = null; fresh = true; return false; }
  const result = {'+': () => a+b, '-': () => a-b, '*': () => a*b, '/': () => a/b}[operator]();
  current = Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Ошибка';
  previous = operator = null; fresh = true;
  return current !== 'Ошибка';
}
function inputNumber(n) {
  if (fresh || current === 'Ошибка') { current = '0'; fresh = false; }
  if (current.replace('-', '').replace('.', '').length < 15) current = current === '0' ? n : current + n;
}
function chooseOperator(op) {
  if (current === 'Ошибка') return;
  if (previous !== null && !fresh && !calculate()) return;
  previous = current; operator = op; fresh = true;
}
function action(name) {
  if (name === 'clear') { current = '0'; previous = operator = null; fresh = false; }
  if (name === 'back' && !fresh && current !== 'Ошибка') current = current.length > 1 ? current.slice(0,-1) : '0';
  if (name === 'decimal') { if (fresh || current === 'Ошибка') { current = '0'; fresh = false; } if (!current.includes('.')) current += '.'; }
  if (name === 'percent' && current !== 'Ошибка') { current = String(Number(current) / 100); fresh = false; }
  if (name === 'equals' && !fresh) calculate();
}
document.querySelector('.keys').addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  if (button.dataset.op) chooseOperator(button.dataset.op);
  if (button.dataset.action) action(button.dataset.action);
  fun(button.dataset.action === 'equals');
  render();
});
document.addEventListener('keydown', e => {
  if (e.target.closest('.toggle') && (e.key === 'Enter' || e.key === ' ')) return;
  if (/^[0-9]$/.test(e.key)) inputNumber(e.key);
  else if (['+', '-', '*', '/'].includes(e.key)) chooseOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') action('equals');
  else if (e.key === '.' || e.key === ',') action('decimal');
  else if (e.key === 'Backspace') action('back');
  else if (e.key === 'Escape') action('clear');
  else if (e.key === '%') action('percent');
  else return;
  e.preventDefault(); fun(e.key === 'Enter' || e.key === '='); render();
});
