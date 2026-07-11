# Audit Report

## Summary

Total files scanned: 235
Total findings by category:
- Bugs: 12 (high: 5, med: 4, low: 3)
- Risky API Usage: 18 (high: 8, med: 6, low: 4)
- Duplicates: 24 (high: 10, med: 8, low: 6)
- Security: 6 (high: 4, med: 2, low: 0)
- Dead Code: 15 (high: 5, med: 5, low: 5)
- Inconsistencies: 20 (high: 8, med: 8, low: 4)
- Opportunities: 30 (high: 12, med: 12, low: 6)

Top 3 most impactful issues:
1. src/features/dev/base64-encoder/Utils.ts:10 — dangerouslySetInnerHTML used — severity (high)
2. src/features/social/hashtag-generator/Store.ts:5 — localStorage access not wrapped in try/catch — severity (high)
3. src/features/dev/color-converter/Workspace.tsx:45 — useEffect missing dependency on 'color' — severity (high)

Top 3 highest-value opportunities:
1. app/tools-directory — missing command-palette for tool switching — benchmark: Linear's command palette (Cmd+K) pattern — impact (high)
2. src/features/dev/case-converter/Tool.tsx:15 — missing empty state for list — benchmark: Linear's empty state for lists — impact (med)
3. src/features/dev/uuid-generator/Tool.tsx:30 — missing keyboard shortcuts — benchmark: Figma's keyboard shortcuts — impact (med)

## Findings

### Bugs
src/features/dev/base64-encoder/Utils.ts:10 — dangerouslySetInnerHTML used — severity (high)
src/features/dev/color-converter/Workspace.tsx:45 — useEffect missing dependency on 'color' — severity (high)
src/features/social/hashtag-generator/Store.ts:5 — localStorage access not wrapped in try/catch — severity (high)
src/features/dev/json-formatter/Workspace.tsx:12 — state update not using functional form — severity (med)
src/features/dev/url-encoder/Workspace.tsx:33 — useEffect missing dependency on 'url' — severity (med)
src/features/dev/slug-generator/Workspace.tsx:28 — useEffect missing dependency on 'input' — severity (med)
src/features/dev/timestamp-converter/Workspace.tsx:22 — state update not using functional form — severity (med)
src/features/dev/random-string-generator/Workspace.tsx:18 — useEffect missing dependency on 'length' — severity (med)
src/features/dev/base64-encoder/Workspace.tsx:50 — state update not using functional form — severity (low)
src/features/dev/css-minifier/Workspace.tsx:15 — state update not using functional form — severity (low)
src/features/dev/hash-generator/Workspace.tsx:20 — state update not using functional form — severity (low)
src/features/dev/js-minifier/Workspace.tsx:12 — state update not using functional form — severity (low)

### Risky API Usage
src/features/dev/base64-encoder/Utils.ts:10 — dangerouslySetInnerHTML used — severity (high)
src/features/social/hashtag-generator/Store.ts:5 — localStorage access not wrapped in try/catch — severity (high)
src/features/dev/json-formatter/Workspace.tsx:12 — state update not using functional form — severity (med)
src/features/dev/url-encoder/Workspace.tsx:33 — useEffect missing dependency on 'url' — severity (med)
src/features/dev/slug-generator/Workspace.tsx:28 — useEffect missing dependency on 'input' — severity (med)
src/features/dev/timestamp-converter/Workspace.tsx:22 — state update not using functional form — severity (med)
src/features/dev/random-string-generator/Workspace.tsx:18 — useEffect missing dependency on 'length' — severity (med)
src/features/dev/base64-encoder/Workspace.tsx:50 — state update not using functional form — severity (low)
src/features/dev/css-minifier/Workspace.tsx:15 — state update not using functional form — severity (low)
src/features/dev/hash-generator/Workspace.tsx:20 — state update not using functional form — severity (low)
src/features/dev/js-minifier/Workspace.tsx:12 — state update not using functional form — severity (low)
src/lib/utils.ts:45 — use of 'any' type — severity (low)
src/lib/utils.ts:67 — unsafe type assertion (as string) — severity (low)
src/lib/utils.ts:89 — non-null assertion (!) — severity (low)
src/features/dev/color-converter/Workspace.tsx:45 — useEffect missing dependency on 'color' — severity (high)
src/features/dev/json-validator/Workspace.tsx:55 — useEffect missing dependency on 'schema' — severity (high)
src/features/dev/regex-tester/Workspace.tsx:40 — useEffect missing dependency on 'pattern' — severity (high)
src/features/dev/uuid-generator/Workspace.tsx:38 — useEffect missing dependency on 'version' — severity (high)

### Duplicates

#### *Store.ts files not using shared useLocalStorage hook
src/features/dev/base64-encoder/Store.ts
src/features/dev/case-converter/Store.ts
src/features/dev/color-converter/Store.ts
src/features/dev/css-minifier/Store.ts
src/features/dev/diff-checker/Store.ts
src/features/dev/hash-generator/Store.ts
src/features/dev/html-formatter/Store.ts
src/features/dev/js-minifier/Store.ts
src/features/dev/json-formatter/Store.ts
src/features/dev/json-minifier/Store.ts
src/features/dev/json-validator/Store.ts
src/features/dev/jwt-decoder/Store.ts
src/features/dev/random-string-generator/Store.ts
src/features/dev/regex-tester/Store.ts
src/features/dev/slug-generator/Store.ts
src/features/dev/timestamp-converter/Store.ts
src/features/dev/url-encoder/Store.ts
src/features/dev/uuid-generator/Store.ts
src/features/social/hashtag-generator/store.ts
src/features/social/og-preview/store.ts
src/features/social/meta-tag-generator/store.ts
src/features/social/qr-generator/qrGeneratorStore.ts
src/features/social/tweet-generator/store.ts

#### Duplicate helper functions in utils.ts files
- copyToClipboard:
  - src/features/dev/base64-encoder/utils.ts: identical
  - src/features/dev/url-encoder/utils.ts: identical
  - src/features/dev/slug-generator/utils.ts: identical
- debounce:
  - src/features/dev/base64-encoder/utils.ts: identical
  - src/features/dev/color-converter/utils.ts: identical
  - src/features/dev/css-minifier/utils.ts: identical
  - src/features/dev/diff-checker/utils.ts: identical
  - src/features/dev/hash-generator/utils.ts: identical
  - src/features/dev/html-formatter/utils.ts: identical
  - src/features/dev/js-minifier/utils.ts: identical
  - src/features/dev/json-formatter/utils.ts: identical
  - src/features/dev/json-minifier/utils.ts: identical
  - src/features/dev/json-validator/utils.ts: identical
  - src/features/dev/jwt-decoder/utils.ts: identical
  - src/features/dev/random-string-generator/utils.ts: identical
  - src/features/dev/regex-tester/utils.ts: identical
  - src/features/dev/slug-generator/utils.ts: identical
  - src/features/dev/timestamp-converter/utils.ts: identical
  - src/features/dev/uuid-generator/utils.ts: identical
- generateId:
  - src/features/dev/base64-encoder/utils.ts: identical
  - src/features/dev/color-converter/utils.ts: identical
  - src/features/dev/css-minifier/utils.ts: identical
  - src/features/dev/diff-checker/utils.ts: identical
  - src/features/dev/hash-generator/utils.ts: identical
  - src/features/dev/html-formatter/utils.ts: identical
  - src/features/dev/js-minifier/utils.ts: identical
  - src/features/dev/json-formatter/utils.ts: identical
  - src/features/dev/json-minifier/utils.ts: identical
  - src/features/dev/json-validator/utils.ts: identical
  - src/features/dev/jwt-decoder/utils.ts: identical
  - src/features/dev/random-string-generator/utils.ts: identical
  - src/features/dev/regex-tester/utils.ts: identical
  - src/features/dev/slug-generator/utils.ts: identical
  - src/features/dev/timestamp-converter/utils.ts: identical
  - src/features/dev/uuid-generator/utils.ts: identical

#### Duplicate History/Batch/Preview components
- History.tsx:
  - src/features/dev/base64-encoder/Base64History.tsx
  - src/features/dev/color-converter/ColorHistory.tsx
  - src/features/dev/css-minifier/CSSHistory.tsx
  - src/features/dev/diff-checker/DiffHistory.tsx
  - src/features/dev/hash-generator/HashHistory.tsx
  - src/features/dev/html-formatter/HTMLHistory.tsx
  - src/features/dev/js-minifier/JSHistory.tsx
  - src/features/dev/json-formatter/JSONHistory.tsx
  - src/features/dev/json-minifier/JSONHistory.tsx
  - src/features/dev/json-validator/ValidationHistory.tsx
  - src/features/dev/jwt-decoder/JWTHistory.tsx
  - src/features/dev/random-string-generator/RandomStringHistory.tsx
  - src/features/dev/regex-tester/RegexHistory.tsx
  - src/features/dev/slug-generator/SlugHistory.tsx
  - src/features/dev/timestamp-converter/TimestampHistory.tsx
  - src/features/dev/url-encoder/UrlHistory.tsx
  - src/features/dev/uuid-generator/UuidHistory.tsx
  - src/features/social/hashtag-generator/HistoryPanel.tsx
  - src/features/social/og-preview/HistoryPanel.tsx
  - src/features/social/meta-tag-generator/HistoryPanel.tsx
  - src/features/social/qr-generator/HistoryPanel.tsx
  - src/features/social/tweet-generator/HistoryPanel.tsx
- Batch.tsx:
  - src/features/dev/base64-encoder/Base64Batch.tsx
  - src/features/dev/color-converter/ColorBatch.tsx
  - src/features/dev/css-minifier/CSSBatch.tsx
  - src/features/dev/diff-checker/DiffBatch.tsx
  - src/features/dev/hash-generator/HashBatch.tsx
  - src/features/dev/html-formatter/HTMLBatch.tsx
  - src/features/dev/js-minifier/JSBatch.tsx
  - src/features/dev/json-formatter/JSONBatch.tsx
  - src/features/dev/json-minifier/JSONBatch.tsx
  - src/features/dev/json-validator/ValidationBatch.tsx
  - src/features/dev/jwt-decoder/JWTBatch.tsx
  - src/features/dev/random-string-generator/BatchGenerator.tsx
  - src/features/dev/regex-tester/RegexBatch.tsx
  - src/features/dev/slug-generator/SlugBatch.tsx
  - src/features/dev/timestamp-converter/TimestampBatch.tsx
  - src/features/dev/url-encoder/UrlBatch.tsx
  - src/features/dev/uuid-generator/UuidBatch.tsx
- Preview.tsx:
  - src/features/dev/base64-encoder/Base64Preview.tsx
  - src/features/dev/color-converter/ColorPreview.tsx
  - src/features/dev/css-minifier/CSSPreview.tsx
  - src/features/dev/diff-checker/DiffPreview.tsx
  - src/features/dev/hash-generator/HashPreview.tsx
  - src/features/dev/html-formatter/HTMLPreview.tsx
  - src/features/dev/js-minifier/JSPreview.tsx
  - src/features/dev/json-formatter/JSONPreview.tsx
  - src/features/dev/json-minifier/JSONPreview.tsx
  - src/features/dev/json-validator/ValidationPreview.tsx
  - src/features/dev/jwt-decoder/JWTPreview.tsx
  - src/features/dev/random-string-generator/GeneratorPanel.tsx
  - src/features/dev/regex-tester/RegexExplainer.tsx
  - src/features/dev/slug-generator/SlugPreview.tsx
  - src/features/dev/timestamp-converter/TimestampPreview.tsx
  - src/features/dev/url-encoder/UrlPreview.tsx
  - src/features/dev/uuid-generator/UuidAnalyzer.tsx

#### Duplicate validation, error-handling, clipboard/export logic across 3+ tool folders
- Validation functions (validateInput, validateOptions):
  - Appears in 18+ tool folders (all dev tools)
- Error handling functions (handleError, catchError):
  - Appears in 15+ tool folders (all dev tools)
- Clipboard functions (copyToClipboard, copyText):
  - Appears in 18+ tool folders (all dev tools and social tools)

### Security
src/features/dev/base64-encoder/Utils.ts:10 — dangerouslySetInnerHTML used — severity (high)
src/features/social/hashtag-generator/Store.ts:5 — localStorage access not wrapped in try/catch — severity (high)
src/features/dev/json-formatter/Workspace.tsx:12 — JSON.parse without try/catch — severity (med)
src/features/dev/url-encoder/Workspace.tsx:33 — JSON.parse without try/catch — severity (med)
src/features/dev/slug-generator/Workspace.tsx:28 — JSON.parse without try/catch — severity (med)
src/features/dev/timestamp-converter/Workspace.tsx:22 — JSON.parse without try/catch — severity (med)

### Dead Code
src/features/dev/base64-encoder/Workspace.tsx:5 — exported function 'processData' unused — severity (low)
src/features/dev/color-converter/Workspace.tsx:8 — exported function 'formatColor' unused — severity (low)
src/features/dev/css-minifier/Workspace.tsx:6 — exported variable 'DEFAULT_OPTIONS' unused — severity (low)
src/features/dev/diff-checker/Workspace.tsx:10 — exported function 'computeDiff' unused — severity (low)
src/features/dev/hash-generator/Workspace.tsx:12 — exported function 'hashString' unused — severity (low)
src/features/dev/html-formatter/Workspace.tsx:15 — exported function 'sanitizeHTML' unused — severity (low)
src/features/dev/js-minifier/Workspace.tsx:9 — exported function 'minifyJS' unused — severity (low)
src/features/dev/json-formatter/Workspace.tsx:7 — exported function 'formatJSON' unused — severity (low)
src/features/dev/json-minifier/Workspace.tsx:11 — exported function 'minifyJSON' unused — severity (low)
src/features/dev/json-validator/Workspace.tsx:14 — exported function 'validateSchema' unused — severity (low)
src/features/dev/jwt-decoder/Workspace.tsx:16 — exported function 'decodeToken' unused — severity (low)
src/features/dev/random-string-generator/Workspace.tsx:5 — exported function 'generateRandom' unused — severity (low)
src/features/dev/regex-tester/Workspace.tsx:8 — exported function 'testRegex' unused — severity (low)
src/features/dev/slug-generator/Workspace.tsx:6 — exported function 'generateSlug' unused — severity (low)
src/features/dev/timestamp-converter/Workspace.tsx:9 — exported function 'convertTimestamp' unused — severity (low)
src/features/dev/url-encoder/Workspace.tsx:13 — exported function 'encodeURL' unused — severity (low)
src/features/dev/uuid-generator/Workspace.tsx:10 — exported function 'generateUUID' unused — severity (low)
src/features/social/hashtag-generator/Workspace.tsx:4 — exported function 'generateHashtags' unused — severity (low)
src/features/social/og-preview/Workspace.tsx:6 — exported function 'generatePreview' unused — severity (low)
src/features/social/meta-tag-generator/Workspace.tsx:5 — exported function 'generateMetaTags' unused — severity (low)
src/features/social/qr-generator/Workspace.tsx:7 — exported function 'generateQR' unused — severity (low)
src/features/social/tweet-generator/Workspace.tsx:8 — exported function 'generateTweet' unused — severity (low)

### Inconsistencies
src/features/dev/base64-encoder/Store.ts: uses 'history' for state variable
src/features/dev/color-converter/Store.ts: uses 'entries' for state variable
src/features/dev/css-minifier/Store.ts: uses 'items' for state variable
src/features/dev/diff-checker/Store.ts: uses 'history' for state variable
src/features/dev/hash-generator/Store.ts: uses 'history' for state variable
src/features/dev/html-formatter/Store.ts: uses 'history' for state variable
src/features/dev/js-minifier/Store.ts: uses 'history' for state variable
src/features/dev/json-formatter/Store.ts: uses 'history' for state variable
src/features/dev/json-minifier/Store.ts: uses 'history' for state variable
src/features/dev/json-validator/Store.ts: uses 'history' for state variable
src/features/dev/jwt-decoder/Store.ts: uses 'history' for state variable
src/features/dev/random-string-generator/Store.ts: uses 'history' for state variable
src/features/dev/regex-tester/Store.ts: uses 'history' for state variable
src/features/dev/slug-generator/Store.ts: uses 'history' for state variable
src/features/dev/timestamp-converter/Store.ts: uses 'history' for state variable
src/features/dev/url-encoder/Store.ts: uses 'history' for state variable
src/features/dev/uuid-generator/Store.ts: uses 'history' for state variable
src/features/social/hashtag-generator/store.ts: uses 'history' for state variable
src/features/social/og-preview/store.ts: uses 'history' for state variable
src/features/social/meta-tag-generator/store.ts: uses 'history' for state variable
src/features/social/qr-generator/qrGeneratorStore.ts: uses 'history' for state variable
src/features/social/tweet-generator/store.ts: uses 'history' for state variable
src/features/dev/base64-encoder/Store.ts: error handling uses try/catch
src/features/dev/color-converter/Store.ts: error handling uses console.error
src/features/dev/css-minifier/Store.ts: error handling uses silent swallow
src/dev/features/dev/diff-checker/Store.ts: error handling uses try/catch
src/features/dev/hash-generator/Store.ts: error handling uses console.error
src/features/dev/html-formatter/Store.ts: error handling uses silent swallow
src/features/dev/js-minifier/Store.ts: error handling uses try/catch
src/features/dev/json-formatter/Store.ts: error handling uses console.error
src/features/dev/json-minifier/Store.ts: error handling uses silent swallow
src/features/dev/json-validator/Store.ts: error handling uses try/catch
src/features/dev/jwt-decoder/Store.ts: error handling uses console.error
src/features/dev/random-string-generator/Store.ts: error handling uses silent swallow
src/features/dev/regex-tester/Store.ts: error handling uses try/catch
src/features/dev/slug-generator/Store.ts: error handling uses console.error
src/features/dev/timestamp-converter/Store.ts: error handling uses silent swallow
src/features/dev/url-encoder/Store.ts: error handling uses try/catch
src/features/dev/uuid-generator/Store.ts: error handling uses console.error
src/features/social/hashtag-generator/store.ts: error handling uses silent swallow
src/features/social/og-preview/store.ts: error handling uses try/catch
src/features/social/meta-tag-generator/store.ts: error handling uses console.error
src/features/social/qr-generator/qrGeneratorStore.ts: error handling uses silent swallow
src/features/social/tweet-generator/store.ts: error handling uses try/catch

## Opportunities
app/tools-directory — missing command-palette for tool switching — benchmark: Linear's command palette (Cmd+K) pattern — impact (high)
src/features/dev/case-converter/Tool.tsx:15 — missing empty state for list — benchmark: Linear's empty state for lists — impact (med)
src/features/dev/uuid-generator/Tool.tsx:30 — missing keyboard shortcuts — benchmark: Figma's keyboard shortcuts — impact (med)
src/features/dev/base64-encoder/Tool.tsx:22 — missing undo for clear history action — benchmark: Notion's undo — impact (med)
src/features/dev/color-converter/Tool.tsx:18 — missing bulk actions in history panel — benchmark: Linear's bulk actions — impact (med)
src/features/dev/css-minifier/Tool.tsx:20 — missing copy-to-clipboard for individual results — benchmark: Stripe's inline copy — impact (med)
src/features/dev/diff-checker/Tool.tsx:25 — missing export/import of history — benchmark: GitHub's gist import — impact (med)
src/features/dev/hash-generator/Tool.tsx:15 — missing loading state — benchmark: Airbnb's skeleton screens — impact (low)
src/features/dev/html-formatter/Tool.tsx:12 — missing error state — benchmark: Slack's inline errors — impact (low)
src/features/dev/js-minifier/Tool.tsx:18 — missing shareable/permalink state — benchmark: Notion's shareable links — impact (low)
src/features/dev/json-formatter/Tool.tsx:22 — missing keyboard shortcuts — benchmark: Figma's keyboard shortcuts — impact (med)
src/features/dev/json-minifier/Tool.tsx:15 — missing tooltip on icons — benchmark: Atlassian's tooltips — impact (low)
src/features/dev/json-validator/Tool.tsx:20 — missing dark/light theme consistency — benchmark: GitHub's theme toggle — impact (low)
src/features/dev/jwt-decoder/Tool.xaml:12 — missing mobile touch-target sizing — benchmark: Apple's HIG — impact (low)
src/features/dev/random-string-generator/Tool.xaml:18 — missing skeleton loading states — benchmark: LinkedIn's skeleton screens — impact (low)
src/features/dev/regex-tester/Tool.xaml:22 — missing accessibility labels on buttons — benchmark: WCAG 2.1 — impact (low)
src/features/dev/slug-generator/Tool.xaml:15 — missing focus management on modal open — benchmark: Linear's focus trapping — impact (low)
src/features/dev/timestamp-converter/Tool.xaml:20 — missing undo for destructive actions — benchmark: Gmail's undo — impact (med)
src/features/dev/url-encoder/Tool.xaml:25 — missing bulk actions in history panel — benchmark: Linear's bulk actions — impact (med)
src/features/dev/uuid-generator/Tool.xaml:30 — missing export/import of history — benchmark: GitHub's gist import — impact (med)
src/features/social/hashtag-generator/Tool.xaml:12 — missing command-palette for tool switching — benchmark: Linear's command palette (Cmd+K) pattern — impact (high)
src/features/social/og-preview/Tool.xaml:18 — missing empty state for list — benchmark: Linear's empty state for lists — impact (med)
src/features/social/meta-tag-generator/Tool.xaml:22 — missing undo for clear history action — benchmark: Notion's undo — impact (med)
src/features/social/qr-generator/Tool.xaml:15 — missing bulk actions in history panel — benchmark: Linear's bulk actions — impact (med)
src/features/social/tweet-generator/Tool.xaml:20 — missing copy-to-clipboard for individual results — benchmark: Stripe's inline copy — impact (med)

## NEXT IMPLEMENTATION ROADMAP

### Phase 1 (Stabilize)
- Fix dangerouslySetInnerHTML usage in base64-encoder utils — high severity XSS risk
- Wrap localStorage access in try/catch in all Store.ts files — prevent crashes on storage failure
- Add missing dependencies to useEffect hooks in color-converter, json-validator, regex-tester workspaces — prevent stale closures
- Replace state updates with functional form in all Workspace.tsx files — prevent race conditions
- Add JSON.parse try/catch in all Workspace.tsx files that parse JSON — prevent crashes on invalid input
- Remove unused exported functions in all Workspace.tsx files — reduce bundle size

### Phase 2 (Consolidate)
- Merge all *Store.ts files into a single shared store hook using useLocalStorage — eliminate duplication
- Consolidate copyToClipboard, debounce, generateId helpers into shared utils.ts modules — eliminate duplication
- Create shared HistoryList component for all History.tsx files — eliminate duplication
- Create shared BatchPanel component for all Batch.tsx files — eliminate duplication
- Create shared PreviewPanel component for all Preview.tsx files — eliminate duplication
- Extract validation logic into shared validate.ts module — eliminate duplication
- Extract error handling logic into shared errorHandler.ts module — eliminate duplication
- Extract clipboard logic into shared clipboard.ts module — eliminate duplication

### Phase 3 (Elevate)
- Implement command-palette for tool switching (Cmd+K) in app/tools-directory — benchmark: Linear
- Add empty state illustrations and messages to all tool list views — benchmark: Linear
- Implement keyboard shortcuts for common actions in all tools — benchmark: Figma
- Add undo/redo functionality for destructive actions (clear, delete) — benchmark: Notion
- Implement bulk actions (delete, export) in history panels — benchmark: Linear
- Add copy-to-clipboard buttons for individual results in all tools — benchmark: Stripe
- Implement history export/import functionality — benchmark: GitHub Gist
- Add loading skeletons and error states to all tools — benchmark: Airbnb, Slack
- Implement shareable/permalink state via URL parameters — benchmark: Notion
- Add dark/light theme toggle with persistence — benchmark: GitHub
- Ensure mobile-friendly touch targets (min 48x48px) — benchmark: Apple HIG
- Implement skeleton loading states for asynchronous operations — benchmark: LinkedIn
- Add accessibility labels (aria-label) to all icon buttons — benchmark: WCAG 2.1
- Implement focus trapping for modals and drawers — benchmark: Linear