export interface Result { value: string; description: string; }

const fmt = (x: number) => String(Number(x.toFixed(6)));

function geometry(op: 'area' | 'perimeter', shape: string, n: number[]): Result | null {
  const need: Record<string, number> = { rect: 2, square: 1, circle: 1, triangle: 3 };
  if (n.length !== need[shape] || n.some(x => x < 0)) { return null; }
  let v: number;
  let name: string;
  switch (shape) {
    case 'rect':
      v = op === 'area' ? n[0] * n[1] : 2 * (n[0] + n[1]);
      name = 'прямоугольник'; break;
    case 'square':
      v = op === 'area' ? n[0] ** 2 : 4 * n[0];
      name = 'квадрат'; break;
    case 'circle':
      v = op === 'area' ? Math.PI * n[0] ** 2 : 2 * Math.PI * n[0];
      name = 'круг'; break;
    default: {
      const [a, b, c] = n;
      if (a + b <= c || a + c <= b || b + c <= a) { return null; }
      const p = (a + b + c) / 2;
      v = op === 'area' ? Math.sqrt(p * (p - a) * (p - b) * (p - c)) : a + b + c;
      name = 'треугольник';
    }
  }
  return { value: fmt(v), description: `${op === 'area' ? 'площадь' : 'периметр'}: ${name} ${n.join('×')}` };
}

export function evaluateLine(raw: string): Result | null {
  let s = raw.trim().replace(/^(\/\/+|#+)\s*/, '');
  const marker = /\s*=\s*\?\s*$/.test(s);
  s = s.replace(/\s*=\s*\?\s*$/, '').replace(/;$/, '').trim();
  if (!s) { return null; }

  const call = s.match(/^(?:print\()?\s*(?:(rect|square|circle|triangle)_)?(area|perimeter)\(\s*(-?[\d.]+(?:\s*,\s*-?[\d.]+)*)\s*\)\)?$/i);
  if (call) {
    const n = call[3].split(',').map(Number);
    const shape = call[1]?.toLowerCase() ?? (n.length === 3 ? 'triangle' : 'rect');
    return geometry(call[2].toLowerCase() as 'area' | 'perimeter', shape, n);
  }

  const w = s.toLowerCase();
  if (/^[a-zа-яё0-9\s.,]+$/.test(w)) {
    const op = /площад|area/.test(w) ? 'area'
      : /периметр|perimeter|длина|circumference/.test(w) ? 'perimeter' : null;
    const shape = /прямоугол|rect/.test(w) ? 'rect'
      : /квадрат|square/.test(w) ? 'square'
      : /круг|окружн|circle/.test(w) ? 'circle'
      : /треугол|triang/.test(w) ? 'triangle' : null;
    if (op && shape) {
      return geometry(op, shape, (w.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
    }
  }

  if (marker && /^[\d\s+\-*/^().]+$/.test(s)) {
    try {
      const v = Function(`"use strict"; return (${s.replace(/\^/g, '**')});`)();
      if (typeof v === 'number' && Number.isFinite(v)) {
        return { value: fmt(v), description: 'выражение' };
      }
    } catch { /* не выражение */ }
  }
  return null;
}