import { test, expect, describe, beforeAll } from 'bun:test';
import { poseidon } from '../src/poseidon.ts';
import { buildPoseidonOpt as buildPoseidon } from 'circomlibjs';

type CircomlibPoseidon = {
  (inputs: bigint[], initState?: bigint, nOut?: number): bigint;
  F: { toObject(x: Uint8Array): bigint };
};

let ref: CircomlibPoseidon;

beforeAll(async () => {
  ref = (await buildPoseidon()) as CircomlibPoseidon;
});

// Normalise circomlibjs output: it returns an ffjavascript field element
// (a Uint8Array internally), so we use `.F.toObject()` to get a bigint.
function refHash(inputs: bigint[]): bigint {
  return ref.F.toObject(ref(inputs));
}

describe('poseidon – circomlibjs compatibility', () => {
  describe('input sizes 1–6 (most common in ZK circuits)', () => {
    for (let n = 1; n <= 6; n++) {
      const inputs = Array.from({ length: n }, (_, i) => BigInt(i + 1));

      test(`poseidon([${inputs}]) matches circomlibjs`, () => {
        expect(poseidon(inputs)).toBe(refHash(inputs));
      });
    }
  });

  describe('input sizes 7–16 (full range)', () => {
    for (let n = 7; n <= 16; n++) {
      const inputs = Array.from({ length: n }, (_, i) => BigInt(i + 1));

      test(`poseidon(${n} inputs) matches circomlibjs`, () => {
        expect(poseidon(inputs)).toBe(refHash(inputs));
      });
    }
  });

  describe('edge cases', () => {
    test('all-zero inputs', () => {
      const inputs = [0n, 0n, 0n];
      expect(poseidon(inputs)).toBe(refHash(inputs));
    });

    test('single zero', () => {
      expect(poseidon([0n])).toBe(refHash([0n]));
    });

    test('large values near field boundary', () => {
      const p = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
      const inputs = [p - 1n, p - 2n, p - 3n];
      expect(poseidon(inputs)).toBe(refHash(inputs));
    });

    test('mixed small and large values', () => {
      const p = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
      const inputs = [1n, p - 1n, 12345678901234567890n];
      expect(poseidon(inputs)).toBe(refHash(inputs));
    });
  });

  describe('validation', () => {
    test('throws on empty input', () => {
      expect(() => poseidon([])).toThrow(RangeError);
    });

    test('throws on more than 16 inputs', () => {
      expect(() => poseidon(Array(17).fill(1n))).toThrow(RangeError);
    });

    test('throws on out-of-range input', () => {
      const p = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
      expect(() => poseidon([p])).toThrow(RangeError);
    });

    test('throws on negative input', () => {
      expect(() => poseidon([-1n])).toThrow(RangeError);
    });
  });
});
