# Form Design Audit Checklist

## Quick Form Check (10 min)

- [ ] Form has no unnecessary fields
- [ ] Labels are visible and clear
- [ ] Inputs are large enough to tap (44x44px)
- [ ] Error messages are specific
- [ ] Form works on mobile

## Complete Form Audit (1-2 hours)

### Field Design

#### Labels
- [ ] Every input has a visible label
- [ ] Labels are above inputs (mobile), left or above (desktop)
- [ ] Labels use clear language (no jargon)
- [ ] Required fields are marked (✱ or "required")
- [ ] Optional fields are marked "optional"

#### Input Fields
- [ ] Correct input type for each field (email, tel, date, etc.)
- [ ] Input size reflects typical content length
- [ ] Placeholder text is helpful, not label
- [ ] Font size is 16px+ (prevents iOS zoom)
- [ ] Autocomplete is enabled where applicable
- [ ] Input accepts expected formats

#### Help Text/Instructions
- [ ] Format requirements are documented
- [ ] Examples provided (e.g., "MM/DD/YYYY")
- [ ] Validation hints shown before typing
- [ ] Complex fields have explanations
- [ ] Help text is concise and clear

### Field Types

#### Text Input
- [ ] Single-line text when appropriate
- [ ] No character limit unless necessary
- [ ] Copy/paste is enabled
- [ ] Works with screen readers

#### Textarea
- [ ] Used for multi-line content
- [ ] Expandable height as user types
- [ ] Character count shown if limited
- [ ] Placeholder text helpful

#### Select/Dropdown
- [ ] Default placeholder is instructive ("Choose...")
- [ ] Options are sorted logically
- [ ] Grouped if many options (optgroup)
- [ ] Works with keyboard
- [ ] Mobile shows native picker

#### Radio Buttons
- [ ] Used for mutually exclusive options
- [ ] Options clearly labeled
- [ ] One option is pre-selected if appropriate
- [ ] Touch area is large enough

#### Checkboxes
- [ ] Used for multiple selections
- [ ] Options clearly labeled
- [ ] Touch area includes label
- [ ] Related checkboxes grouped

#### Date Picker
- [ ] Mobile shows native date picker
- [ ] Format is clear
- [ ] Keyboard entry works
- [ ] Desktop shows calendar UI

#### Email Input
- [ ] type="email" (not type="text")
- [ ] Mobile shows email keyboard
- [ ] Validation is lenient (allow valid formats)
- [ ] Confirmation email sent if possible

#### Password Input
- [ ] Hidden by default
- [ ] Show/hide toggle available
- [ ] Reveals briefly when typing (Android)
- [ ] Minimum 8 characters required
- [ ] Rules shown before typing

#### File Input
- [ ] Accepted file types specified
- [ ] File size limits shown
- [ ] Preview for images
- [ ] Drag-and-drop supported
- [ ] Clear file name shown

### Form Layout & Structure

#### Organization
- [ ] Related fields grouped with fieldset
- [ ] Logical question order
- [ ] Progressive disclosure used if appropriate
- [ ] No scrolling surprises

#### Single Column (Mobile)
- [ ] All fields in one column mobile
- [ ] Proper spacing between fields (16px)
- [ ] Full width inputs on mobile
- [ ] No multi-column layouts on small screens

#### Multi-Column (Desktop)
- [ ] Two columns only on large screens
- [ ] Logical field grouping in columns
- [ ] Consistent column width
- [ ] Related fields in same column

#### Spacing
- [ ] Gap between fields: 16px minimum
- [ ] Gap between sections: 24px minimum
- [ ] Padding inside inputs: 12px
- [ ] Touch target height: 44px minimum

### Validation & Error Handling

#### Real-Time Validation
- [ ] Validation happens on blur (not while typing)
- [ ] Doesn't validate required until submission
- [ ] Clear feedback (red border, icon, message)
- [ ] Success state shown (green checkmark)
- [ ] Non-intrusive error messages

#### Error Messages
- [ ] Specific, not generic ("Email already exists" not "Error")
- [ ] Actionable (what to do next)
- [ ] Positive language where possible
- [ ] Located near the error
- [ ] Color + icon + text (not color alone)
- [ ] Announced to screen readers (role="alert")

#### Example Error Messages

**Good:**
- "Password must be at least 8 characters"
- "This email is already registered. Did you mean to log in?"
- "ZIP code must be 5 digits"

**Bad:**
- "Invalid input"
- "Error 422"
- "Please try again"

#### Validation Rules
- [ ] Email validation is reasonable (allow valid formats)
- [ ] Password validation clear upfront
- [ ] Phone number accepts common formats
- [ ] Date validation shows helpful format
- [ ] Address fields validate at correct level

### Accessibility

#### Labels & Associations
- [ ] `<label for="id">` associations correct
- [ ] Implicit labels used where appropriate
- [ ] Labels not hidden with CSS
- [ ] Labels visible, not invisible

#### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Enter submits form
- [ ] Shift+Tab goes backward
- [ ] Tab moves through all fields
- [ ] No keyboard traps

#### Screen Readers
- [ ] Fields have proper labels
- [ ] Error messages announced
- [ ] Required fields announced
- [ ] Instructions read aloud
- [ ] Success state announced
- [ ] Form title describes purpose

#### Focus Management
- [ ] Focus visible on all inputs
- [ ] Focus indicators prominent (3px outline)
- [ ] Focus indicator has good contrast
- [ ] Focus doesn't move unexpectedly
- [ ] Error focus moves to error message

#### ARIA (When Needed)
- [ ] aria-required on required fields
- [ ] aria-invalid on error fields
- [ ] aria-describedby links hints/errors
- [ ] aria-label for icon-only buttons
- [ ] role="alert" for error messages

### Submission & Feedback

#### Submit Button
- [ ] Clear, action-oriented text ("Next" not "Submit")
- [ ] Button is visible and prominent
- [ ] Button is 44x44px minimum
- [ ] Loading state shown during submission
- [ ] Disabled state shown (greyed out)
- [ ] Not disabled unnecessarily

#### Confirmation
- [ ] Success message displayed
- [ ] Clear next step indicated
- [ ] Redirect time adequate (not instant)
- [ ] Data shown for verification
- [ ] Return to form option available

#### Error Recovery
- [ ] Form resubmitted without clearing all fields
- [ ] Error fields preserved their entry
- [ ] User can edit and resubmit easily
- [ ] Back button works
- [ ] Session data preserved if possible

### Mobile-Specific

#### Touch Targets
- [ ] Input fields at least 44x44px
- [ ] Buttons at least 44x44px
- [ ] Spacing between targets 8px+
- [ ] Checkboxes/radios big enough to tap

#### Mobile Keyboards
- [ ] Each field triggers appropriate keyboard
- [ ] Email: shows @ symbol
- [ ] Tel: shows numbers
- [ ] Number: shows numeric pad
- [ ] URL: shows / and .
- [ ] Autocorrect appropriate
- [ ] Spellcheck enabled for text

#### Viewport & Zoom
- [ ] Font size 16px+ (prevents zoom)
- [ ] Form doesn't horizontal scroll
- [ ] Pinch zoom works
- [ ] Double-tap zoom not used oddly
- [ ] Viewport meta tag set correctly

### Testing & Rollout

#### Device Testing
- [ ] iPhone (375px)
- [ ] iPhone Plus (414px)
- [ ] iPad (768px)
- [ ] Android phone (360px)
- [ ] Chrome/Firefox/Safari
- [ ] Screen readers (NVDA, VoiceOver)

#### Usability Testing
- [ ] Tested with 5+ users
- [ ] Mobile users included
- [ ] Completion rate > 70%
- [ ] Time to complete reasonable
- [ ] No major confusion points
- [ ] Error rates low

#### Metrics
- [ ] Completion rate tracked
- [ ] Error rate tracked
- [ ] Time to complete tracked
- [ ] Drop-off points identified
- [ ] Field error rates monitored
- [ ] Form abandonment tracked

### Scoring

**Excellent (90%+ complete)**
- All core checks passed
- Accessibility excellent
- Mobile-optimized
- High completion rates

**Good (75-89% complete)**
- Most checks passed
- Minor accessibility issues
- Mobile functional
- Good completion rates

**Fair (60-74% complete)**
- Basic functionality
- Some accessibility issues
- Mobile needs work
- Moderate completion rates

**Poor (<60% complete)**
- Significant issues
- Major accessibility gaps
- Not mobile friendly
- Low completion rates

