# Form Design & Validation

## Overview

Forms are critical conversion points. Good form design reduces abandonment, prevents errors, and creates positive user experiences.

## Principles

### 1. Minimize Fields
Ask only for essential information:
- ❌ Don't ask for middle initial if not required
- ❌ Don't ask for phone if email is sufficient
- ✅ Ask for name and email only if you really need both

### 2. Single Column Layout
```html
<!-- ✅ Good: Single column mobile-first -->
<form>
  <label for="fname">First Name</label>
  <input id="fname" type="text" required>

  <label for="email">Email</label>
  <input id="email" type="email" required>

  <label for="password">Password</label>
  <input id="password" type="password" required>

  <button type="submit">Sign Up</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
  }

  /* Two columns on large screens only */
  @media (min-width: 1024px) {
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
  }
</style>
```

### 3. Visible Labels
```html
<!-- ❌ Bad: Placeholder as label -->
<input type="email" placeholder="Email address">

<!-- ✅ Good: Visible label + placeholder hint -->
<label for="email">Email Address</label>
<input 
  id="email" 
  type="email" 
  placeholder="name@example.com"
  aria-describedby="email-hint"
>
<p id="email-hint">We'll use this to send confirmation</p>
```

### 4. Clear Input Types
```html
<!-- Use correct input types for better UX -->
<input type="email">       <!-- Mobile: email keyboard -->
<input type="tel">         <!-- Mobile: phone keyboard -->
<input type="number">      <!-- Mobile: numeric keyboard -->
<input type="url">         <!-- Mobile: URL keyboard -->
<input type="date">        <!-- Shows date picker -->
<input type="search">      <!-- Includes clear button -->
<textarea></textarea>      <!-- Multi-line text -->
<select>                   <!-- Dropdown -->
  <option>Choose...</option>
</select>
```

### 5. Proper Spacing & Sizing

```css
form {
  gap: 16px; /* Space between fields */
}

input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
  padding: 12px;
  min-height: 44px; /* Touch target size */
  border-radius: 4px;
  border: 2px solid #ccc;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}
```

## Validation Strategy

### 1. Real-Time Validation
Provide feedback as user types:

```jsx
function EmailInput() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => {
    if (!value) {
      setError('Email is required');
    } else if (!value.includes('@')) {
      setError('Please enter a valid email');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? 'email-error' : undefined}
      />
      {error && (
        <p id="email-error" role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
```

### 2. Clear Error Messages

```
❌ Bad errors:
- "Invalid input"
- "Error 422"
- "Please try again"

✅ Good errors:
- "Password must be at least 8 characters"
- "Email already exists. Try logging in instead."
- "ZIP code must be 5 digits (e.g., 12345)"
```

### 3. Field-Level Hints
```html
<label for="password">Password</label>
<input 
  id="password" 
  type="password"
  aria-describedby="password-hints"
>
<ul id="password-hints">
  <li>At least 8 characters</li>
  <li>Mix of uppercase and lowercase</li>
  <li>At least one number</li>
  <li>At least one special character (!@#$%)</li>
</ul>
```

### 4. Progressive Validation
Don't validate until user moves away from field:

```jsx
<input
  onBlur={() => validateField()} // Validate on blur
  onChange={() => showHint()}      // Show hint on focus
  onFocus={() => clearError()}     // Clear error on focus
/>
```

## Form Patterns

### Sign Up Form (Mobile-First)
```html
<form aria-label="Sign up">
  <h2>Create Account</h2>

  <div>
    <label for="fname">First Name</label>
    <input id="fname" type="text" required>
  </div>

  <div>
    <label for="email">Email</label>
    <input id="email" type="email" required aria-describedby="email-hint">
    <small id="email-hint">We'll send a confirmation link</small>
  </div>

  <div>
    <label for="password">Password</label>
    <input id="password" type="password" required>
  </div>

  <button type="submit">Create Account</button>
  <p>Already have an account? <a href="/login">Log in</a></p>
</form>
```

### Multi-Step Form
```jsx
function MultiStepForm() {
  const [step, setStep] = useState(1);

  return (
    <form>
      <h2>Step {step} of 3</h2>

      {step === 1 && <StepOne />}
      {step === 2 && <StepTwo />}
      {step === 3 && <StepThree />}

      <div>
        {step > 1 && (
          <button 
            type="button" 
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
        )}
        {step < 3 && (
          <button 
            type="button" 
            onClick={() => setStep(step + 1)}
          >
            Next
          </button>
        )}
        {step === 3 && (
          <button type="submit">Complete</button>
        )}
      </div>
    </form>
  );
}
```

### Conditional Fields
```html
<label>
  <input type="checkbox" id="has-company">
  I work for a company
</label>

<div id="company-fields" hidden>
  <label>Company Name</label>
  <input type="text">

  <label>Job Title</label>
  <input type="text">
</div>

<script>
  document.getElementById('has-company').addEventListener('change', (e) => {
    document.getElementById('company-fields').hidden = !e.target.checked;
  });
</script>
```

## Accessibility for Forms

```html
<fieldset>
  <legend>What's your experience level?</legend>
  
  <label>
    <input type="radio" name="experience" value="beginner">
    Beginner
  </label>

  <label>
    <input type="radio" name="experience" value="intermediate">
    Intermediate
  </label>

  <label>
    <input type="radio" name="experience" value="expert">
    Expert
  </label>
</fieldset>
```

## Success State

After form submission:

```jsx
{submitted && !error ? (
  <div role="status" aria-label="Success">
    <h2>✓ Success!</h2>
    <p>Your account has been created.</p>
    <a href="/dashboard">Go to Dashboard</a>
  </div>
) : (
  // Form...
)}
```

## Form Checklist

- [ ] All required fields marked (✱ or "required" text)
- [ ] Labels associated with inputs (<label for="id">)
- [ ] Touch targets at least 44x44px
- [ ] Font size 16px+ (prevents zoom on iOS)
- [ ] Error messages specific and actionable
- [ ] Real-time validation feedback
- [ ] Clear visual focus indicators
- [ ] Help text/hints for complex fields
- [ ] Keyboard navigable with Tab key
- [ ] Form is submitted on Enter key
- [ ] Success confirmation message shown
- [ ] Works on mobile and desktop
- [ ] Works with screen readers

