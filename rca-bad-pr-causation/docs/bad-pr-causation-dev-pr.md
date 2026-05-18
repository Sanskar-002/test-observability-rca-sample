# Faulty PR diffs for Bad PR Causation RCA

Two regression branches off `main`, each carrying exactly one class of fault. The RCA should attribute every test failure on a given branch to its single fault class.

| Branch | Files touched | Expected RCA verdict |
|---|---|---|
| `regression/bad-dev-pr` | `app/bad-pr-causation-tests.html` only | **Bad Dev PR** |
| `regression/bad-automation-pr` | `specs/bad-pr-causation.spec.js` only | **Bad Automation PR** |

The spec on `main` has 6 tests that all pass against the App on `main`. Each branch breaks all 6 of them, but for *different* reasons.

---

## Branch: `regression/bad-dev-pr` — App diffs only

The app HTML is modified. The spec is unchanged. Every failure is a "the app changed" signal.

### 1. Rename login button id — breaks Test 1 (`NoSuchElementException`)

```diff
-        <button id="login-btn">Sign In</button>
+        <button id="signin-btn">Sign In</button>
```

### 2. Change welcome banner text — breaks Test 2 (assertion mismatch)

```diff
-        <div id="welcome-banner" class="banner">Welcome to Stackmate</div>
+        <div id="welcome-banner" class="banner">Hi!</div>
```

### 3. Change profile name text — breaks Test 3 (assertion mismatch)

```diff
-        <div id="profile-name">John Doe</div>
+        <div id="profile-name">Jane Doe</div>
```

### 4. Remove submit-order button — breaks Test 4 (`NoSuchElementException`)

```diff
     <div class="app-section" id="submit-form-section">
         <h3>Order</h3>
-        <button id="submit-form-btn">Submit Order</button>
     </div>
```

### 5. Change cart count text — breaks Test 5 (assertion mismatch)

```diff
-        <div id="cart-count">3 items</div>
+        <div id="cart-count">0 items</div>
```

### 6. Rename logout link id — breaks Test 6 (`NoSuchElementException`)

```diff
-        <a id="logout-link" href="#">Logout</a>
+        <a id="log-out" href="#">Logout</a>
```

### Expected failure signatures (Dev PR)

| Test | Failure |
|---|---|
| should click the Sign In button | `NoSuchElementException` on `#login-btn` |
| should display the welcome banner text | chai: `'Hi!'` !== `'Welcome to Stackmate'` |
| should show the correct profile name | chai: `'Jane Doe'` !== `'John Doe'` |
| should click the Submit Order button | `NoSuchElementException` on `#submit-form-btn` |
| should display the cart count | chai: `'0 items'` !== `'3 items'` |
| should click the Logout link | `NoSuchElementException` on `#logout-link` |

Each failure points at an id or text node that only exists in the App diff.

---

## Branch: `regression/bad-automation-pr` — Spec diffs only

The spec is modified. The app HTML is unchanged. Every failure is a "the test code is wrong" signal.

### 1. Typo'd login selector — breaks Test 1 (`NoSuchElementException`)

```diff
-        await browser.$('#login-btn').click();
+        await browser.$('#login-buton').click();
```

### 2. Wrong expected banner text — breaks Test 2 (assertion mismatch)

```diff
-        expect(bannerText).to.equal('Welcome to Stackmate');
+        expect(bannerText).to.equal('Welcome to Browserstack');
```

### 3. Wrong profile selector — breaks Test 3 (`NoSuchElementException`)

```diff
-        const profileName = await browser.$('#profile-name').getText();
+        const profileName = await browser.$('#user-name').getText();
```

### 4. Typo'd submit-order selector — breaks Test 4 (`NoSuchElementException`)

```diff
-        await browser.$('#submit-form-btn').click();
+        await browser.$('#submitOrder').click();
```

### 5. Wrong expected cart count — breaks Test 5 (assertion mismatch)

```diff
-        expect(cartCount).to.equal('3 items');
+        expect(cartCount).to.equal('three items');
```

### 6. Wrong logout selector — breaks Test 6 (`NoSuchElementException`)

```diff
-        await browser.$('#logout-link').click();
+        await browser.$('#logout-btn').click();
```

### Expected failure signatures (Automation PR)

| Test | Failure |
|---|---|
| should click the Sign In button | `NoSuchElementException` on `#login-buton` (typo only in spec) |
| should display the welcome banner text | chai: `'Welcome to Stackmate'` !== `'Welcome to Browserstack'` |
| should show the correct profile name | `NoSuchElementException` on `#user-name` (spec uses wrong id) |
| should click the Submit Order button | `NoSuchElementException` on `#submitOrder` (spec uses wrong id) |
| should display the cart count | chai: `'3 items'` !== `'three items'` |
| should click the Logout link | `NoSuchElementException` on `#logout-btn` (spec uses wrong id) |

Every failing selector or expected string in this list is present *only* in the spec diff. The App HTML on `main` still serves the original ids and text, so an RCA that checks the app side will find no causative change there.
