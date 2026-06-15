import { test, expect, describe } from 'bun:test';
import { poseidon2, poseidon2Permute, Fp } from '../src/poseidon2.ts';

// ── HorizenLabs BN256 KAT (poseidon2.rs, poseidon2_tests_bn256::kats) ────────
// Input: permutation of [0, 1, 2] over BN256 Fr (= BabyJubJub Fp).
// Source: https://github.com/HorizenLabs/poseidon2/blob/main/plain_implementations/src/poseidon2/poseidon2.rs
describe('poseidon2 – HorizenLabs BN256 KAT', () => {
  test('permute([0, 1, 2]) matches reference output', () => {
    const out = poseidon2Permute([0n, 1n, 2n]);
    expect(out[0]).toBe(0x0bb61d24daca55eebcb1929a82650f328134334da98ea4f847f760054f4a3033n);
    expect(out[1]).toBe(0x303b6f7c86d043bfcbcc80214f26a30277a15d3f74ca654992defe7ff8d03570n);
    expect(out[2]).toBe(0x1ed25194542b12eef8617361c3ba7c52e660b145994427cc86296242cf766ec8n);
  });
});

// ── Hash function behaviour ────────────────────────────────────────────────────
describe('poseidon2 hash', () => {
  test('single input: state = [x, 0, 0]', () => {
    // poseidon2([a]) must equal poseidon2Permute([a, 0, 0])[0]
    const a = 42n;
    expect(poseidon2([a])).toBe(poseidon2Permute([a, 0n, 0n])[0]);
  });

  test('two inputs: state = [a, b, 0]', () => {
    const a = 1n;
    const b = 2n;
    expect(poseidon2([a, b])).toBe(poseidon2Permute([a, b, 0n])[0]);
  });

  test('different inputs produce different digests', () => {
    expect(poseidon2([1n])).not.toBe(poseidon2([2n]));
    expect(poseidon2([1n, 2n])).not.toBe(poseidon2([2n, 1n]));
  });

  test('deterministic — same input gives same output', () => {
    expect(poseidon2([7n, 13n])).toBe(poseidon2([7n, 13n]));
  });

  test('large values near field boundary', () => {
    const p = Fp.ORDER;
    const a = p - 1n;
    const b = p - 2n;
    expect(poseidon2([a, b])).toBe(poseidon2Permute([a, b, 0n])[0]);
  });
});

// ── Validation ─────────────────────────────────────────────────────────────────
describe('poseidon2 validation', () => {
  test('throws on empty input', () => {
    expect(() => poseidon2([])).toThrow(RangeError);
  });

  test('throws on more than 2 inputs', () => {
    expect(() => poseidon2([1n, 2n, 3n])).toThrow(RangeError);
  });

  test('throws on out-of-range input', () => {
    expect(() => poseidon2([Fp.ORDER])).toThrow(RangeError);
  });

  test('throws on negative input', () => {
    expect(() => poseidon2([-1n])).toThrow(RangeError);
  });

  test('permute throws on wrong state length', () => {
    expect(() => poseidon2Permute([1n, 2n])).toThrow(RangeError);
    expect(() => poseidon2Permute([1n, 2n, 3n, 4n])).toThrow(RangeError);
  });
});
