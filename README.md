# noble-poseidon

Poseidon and Poseidon2 hash functions for the BabyJubJub field, built on top of [@noble/curves](https://github.com/paulmillr/noble-curves).

> **Warning** — This library is **unaudited and experimental**. Do not use it in production systems without a full independent security review.

## API

### `poseidon(inputs: bigint[]): bigint`

Poseidon hash over the BabyJubJub field. **Compatible with [circomlibjs](https://github.com/iden3/circomlibjs) / iden3.**

- `inputs` — 1 to 16 field elements (bigints in `[0, Fp.ORDER)`)
- Returns a single field element digest

```ts
import { poseidon } from 'noble-poseidon';

poseidon([1n, 2n, 3n]); // → bigint, identical to circomlibjs output
```

---

### `poseidon2(inputs: bigint[]): bigint`

Poseidon2 hash over the BabyJubJub field. Compatible with the [HorizenLabs reference implementation](https://github.com/HorizenLabs/poseidon2).

- `inputs` — 1 or 2 field elements (bigints in `[0, Fp.ORDER)`)
- State layout: `[input_0, input_1_or_0, 0]` (t = 3)
- Returns `state[0]` after permutation

```ts
import { poseidon2 } from 'noble-poseidon';

poseidon2([1n, 2n]); // → bigint
```

---

### `poseidon2Permute(state: bigint[]): bigint[]`

Raw Poseidon2 permutation for t = 3. Useful for building custom constructions or verifying against reference test vectors.

- `state` — exactly 3 field elements
- Returns all 3 output elements

```ts
import { poseidon2Permute } from 'noble-poseidon';

poseidon2Permute([0n, 1n, 2n]);
// → [
//     0x0bb61d24daca55eebcb1929a82650f328134334da98ea4f847f760054f4a3033n,
//     0x303b6f7c86d043bfcbcc80214f26a30277a15d3f74ca654992defe7ff8d03570n,
//     0x1ed25194542b12eef8617361c3ba7c52e660b145994427cc86296242cf766ec8n,
//   ]
```

---

### `Fp`

The BabyJubJub prime field (`IField<bigint>`). Both `poseidon` and `poseidon2` operate over this same field.

```ts
import { Fp } from 'noble-poseidon';

Fp.ORDER; // 21888242871839275222246405745257275088548364400416034343698204186575808495617n
```
