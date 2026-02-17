# My-Query Benchmark

Performance comparison of **my-query** against other DOM manipulation libraries: jQuery, React, Vue, and Vanilla JS.

## Running the Benchmark

### Method 1: Vite Dev Server (Recommended)

```bash
npm install
npm run dev
```

Then open: http://localhost:5174/benchmark.html

### Method 2: Build and Serve

```bash
npm run build
npx serve dist
```

## Test Scenarios

### 1. Element Creation
Creates N DOM elements and measures the time to build them.

**Tests:** 100, 1,000, 5,000, 10,000 elements

### 2. Element Updates
Updates text content of existing DOM elements.

**Tests:** 100, 1,000, 5,000 updates

### 3. Style Application
Applies CSS styles with variant support (similar to CSS-in-JS).

**Tests:** 100, 1,000, 5,000 elements

### 4. List Rendering
Renders a list of items with dynamic content (real-world scenario).

**Tests:** 50, 200, 500 items

### 5. Reactive Updates
Tests signal-based reactivity and DOM propagation.

**Tests:** 100, 1,000, 5,000 updates

## Libraries Compared

| Library | Description |
|---------|-------------|
| **My-Query** | Custom DOM library with signals |
| **Vanilla JS** | Native browser APIs (baseline) |
| **jQuery** | Classic DOM manipulation library |
| **React** | Virtual DOM framework (element building only) |
| **Vue** | Reactive framework |

## Metrics

- **Time (ms):** Absolute execution time
- **Ops/sec:** Operations per second (higher is better)
- **Relative:** Comparison to the fastest library (1.00x = fastest)

## How to Interpret Results

### Understanding the Values

**Ops/sec (Operations per Second)**
- Measures how many operations the library can perform per second
- **Higher is better** - indicates the library is faster
- Example: 50,000 ops/sec = can create/update 50,000 elements in 1 second

**Relative**
- Comparison to the fastest library in the test
- **1.00x** = is the fastest (winner)
- **2.00x** = is 2x slower than the fastest
- **0.50x** = is half as fast

### Example Table

```
Library     Time     Ops/sec    Relative
────────────────────────────────────────────
Vanilla JS  5.00ms   200,000    1.00x     ← fastest
jQuery      15.00ms  66,667     3.00x     ← 3x slower
My-Query    8.00ms   125,000    1.60x     ← 60% slower
```

### Tips

- For DOM benchmarks, lower **Time** and higher **Ops/sec** are better
- The **Relative** column provides quick visual comparison
- Run tests multiple times for more stable results
- Results vary based on hardware and browser

## Methodology

1. Each test is run in the browser using `performance.now()` for high-precision timing
2. Multiple iterations are not averaged (single run per test)
3. Tests measure the pure operation time without DOM rendering overhead
4. Results are displayed in a sortable table format

## Notes

- React tests only measure the element building phase (createElement), not actual DOM rendering
- Vue tests use the CDN production build
- All tests run in a single browser context
- Results may vary based on hardware and browser
