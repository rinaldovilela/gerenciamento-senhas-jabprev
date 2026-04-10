# User Research & Testing

## Overview

User research grounds design decisions in actual user needs and behaviors. Testing validates assumptions and catches issues before deployment.

## Research Methods

### 1. User Interviews
**Goal:** Understand motivations, pain points, workflows

**Prepare:**
- 5-8 participants per round (good sample size)
- Open-ended questions
- Record sessions (with permission)
- Mix of existing and potential users

**Sample Questions:**
- "Walk me through your typical day..."
- "What frustrates you about current tools?"
- "What would make this easier?"
- "Can you show me how you currently solve this?"

### 2. Usability Testing
**Goal:** Watch users interact with your interface

**Setup:**
- Remote or in-person
- Think-aloud protocol (user narrates thoughts)
- 5-8 participants
- Specific tasks to accomplish

**Observe:**
- Where users get stuck
- Time to complete tasks
- Errors they make
- Emotional reactions

### 3. Surveys
**Goal:** Collect quantitative feedback at scale

**Best for:**
- Measuring satisfaction (CSAT, NPS)
- Validating hypotheses
- Prioritizing features
- Large sample sizes

**Example:**
```
1. How satisfied are you with our product? (1-5)
2. Which feature is most valuable? (Multi-choice)
3. What would most improve your experience? (Open-ended)
```

### 4. Analytics & Behavior
**Goal:** Understand real usage patterns

**Track:**
- Task completion rates
- Bounce points
- Time on page/section
- Feature usage frequency
- Error rates

### 5. A/B Testing
**Goal:** Compare design variations

**Process:**
1. Define hypothesis: "Changing button color from blue to red will increase clicks by 10%"
2. Create variant: Show 50% users variant A, 50% users variant B
3. Measure: Track target metric
4. Analyze: Statistical significance (need ~1000 trials)
5. Implement: Roll out winner or test new hypothesis

## Research Planning Template

```
Research Goal:
[What question are you trying to answer?]

Research Questions:
1. ...
2. ...
3. ...

Success Metrics:
- Task completion rate > 80%
- Time to complete < 2 minutes
- User satisfaction > 4/5

Participant Profile:
- Age: 25-55
- Experience: Intermediate tech users
- Device: Desktop + mobile

Methods:
- [X] User interviews (5 participants)
- [X] Usability testing (5 participants)
- [ ] Surveys (100 participants)
- [ ] A/B testing

Timeline:
- Week 1: Recruit participants
- Week 2: Conduct interviews
- Week 3: Analyze findings
- Week 4: Present recommendations

Findings Template:
- Key insight 1: ...
  - Evidence: ...
  - Recommendation: ...
```

## Usability Testing: Step by Step

### Phase 1: Preparation
1. Define 3-5 key tasks
2. Write task descriptions (don't hint at solution)
3. Set up screen recording
4. Create observation guide

### Phase 2: Welcome
1. Introduce yourself and study purpose
2. Explain "think aloud" protocol
3. Assure that we're testing the design, not them
4. Get consent to record

### Phase 3: Tasks
```
Task 1: "You want to update your profile photo. Go ahead and do that."
Task 2: "Find products related to running shoes."
Task 3: "Complete a purchase and reach the confirmation page."
```

### Phase 4: Debrief
- Ask how they felt about the experience
- Ask what was confusing
- Ask what went well
- Clarify any observed behaviors

### Phase 5: Analysis
```
Task Success Rate:
- Task 1: 5/5 (100%)
- Task 2: 4/5 (80%)
- Task 3: 3/5 (60%) ← Problem area

Time to Complete (avg):
- Task 1: 45 seconds
- Task 2: 2 minutes
- Task 3: 4 minutes

Common Issues:
- Users couldn't find the upload button (Task 1)
- Filter options were unclear (Task 2)
- Payment form was confusing (Task 3)

Recommendations:
1. Make photo upload button more prominent
2. Clarify filter labels and add examples
3. Add progress indicator in checkout flow
4. Simplify payment form
```

## Interview Analysis Template

**User Quote:**
> "I spend 10 minutes every morning trying to find what I need to do today"

**User Need:**
> Help users quickly see their daily tasks

**Design Opportunity:**
> Create a dashboard widget showing today's top priorities at a glance

## Common Interview Mistakes to Avoid

❌ Leading questions: "Don't you think this button should be red?"
✅ Open questions: "What do you think about the button placement?"

❌ Selling: "This feature is amazing, try it!"
✅ Observing: "Go ahead and try this if you'd like."

❌ Multiple questions: "How do you feel and what would you change?"
✅ Single question: "How do you feel about this?"

❌ Interrupting: Jump in quickly
✅ Silence: Let users think and respond

## Feedback Loop

```
1. Observe
   └─ Watch users (testing, analytics)

2. Document
   └─ Record quotes, behaviors, patterns

3. Analyze
   └─ Group findings by theme

4. Prioritize
   └─ Rank by impact and effort

5. Recommend
   └─ Suggest design changes

6. Implement
   └─ Build improvements

7. Validate
   └─ Test with users again
```

## Research Goals by Stage

| Stage | Goal | Method |
|-------|------|--------|
| Discovery | Understand user needs | Interviews, surveys |
| Exploration | Explore solutions | Card sorting, wireframe testing |
| Validation | Validate design | Usability testing, A/B testing |
| Refinement | Improve details | Analytics, heatmaps |

## Sample Size Guidelines

| Method | Sample Size | Time |
|--------|------------|------|
| User interviews | 5-8 | 1 week |
| Usability testing | 5-8 | 1-2 weeks |
| Surveys | 100+ | 1 week |
| A/B testing | 1000+ | 2-4 weeks |

## Resources

- **UserTesting**: Recruit testers, run studies
- **Maze**: Prototype testing and analytics
- **Figma Surveys**: Built-in survey tool
- **Hotjar**: Heatmaps and session recordings
- **Typeform**: Survey creation

