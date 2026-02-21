# Bolt's Performance Journal ⚡

## 2025-07-15 - Initial Assessment
**Learning:** Found multiple canvas-based background effects running simultaneously on all pages. `ParticleCanvas` has an $O(n^2)$ loop calculating distances between ~345 particles every frame using `Math.sqrt`. It also uses `shadowBlur` which is a major performance killer in Canvas2D. `HexCanvas` also performs thousands of trig calls per frame that could be pre-calculated.
**Action:** Optimize `ParticleCanvas` by using squared distances and removing/replacing `shadowBlur`. Pre-calculate trig values in `HexCanvas`.
