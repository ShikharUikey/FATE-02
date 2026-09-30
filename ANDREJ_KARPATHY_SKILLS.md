# Andrej Karpathy Coding Guidelines & AI Agent Skills
> Complete extraction from repository: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills.git)

---

## 📌 Executive Summary

This document compiles the behavioral guidelines and skills derived from **Andrej Karpathy's observations** on LLM coding pitfalls. It provides actionable principles, configuration files for Claude Code and Cursor IDE, and real-world code anti-patterns and solutions.

---

## 🚨 The Problems Identified by Andrej Karpathy

From Andrej Karpathy's analysis of LLM coding behavior:

1. **Assumptions & Hidden Confusion**:
   > *"The models make wrong assumptions on your behalf and just run along with them without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."*

2. **Overengineering & Bloat**:
   > *"They really like to overcomplicate code and APIs, bloat abstractions, don't clean up dead code... implement a bloated construction over 1000 lines when 100 would do."*

3. **Unintended Side Effects**:
   > *"They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."*

4. **Lack of Goal Verification**:
   > *"LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go."*

---

## 💡 The Solution: 4 Core Principles

| Principle | Addresses |
| :--- | :--- |
| **1. Think Before Coding** | Wrong assumptions, hidden confusion, missing tradeoffs |
| **2. Simplicity First** | Overcomplication, bloated abstractions, speculative code |
| **3. Surgical Changes** | Unrelated edits, formatting drift, touching unrequested code |
| **4. Goal-Driven Execution** | Imperative guessing, lack of verification loops |

---

## 🎯 The Four Principles in Detail

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- **State assumptions explicitly**: If uncertain, ask rather than guess.
- **Present multiple interpretations**: Don't pick silently when ambiguity exists.
- **Push back when warranted**: If a simpler approach exists, say so.
- **Stop when confused**: Name what is unclear and ask for clarification.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was explicitly asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

> **The Test:** *Would a senior engineer say this is overcomplicated? If yes, simplify.*

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd write it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

> **The Test:** *Every changed line should trace directly to the user's request.*

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

| Instead of... | Transform to... |
| :--- | :--- |
| *"Add validation"* | *"Write tests for invalid inputs, then make them pass"* |
| *"Fix the bug"* | *"Write a test that reproduces it, then make it pass"* |
| *"Refactor X"* | *"Ensure tests pass before and after"* |

For multi-step tasks, state a brief plan:
```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria allow autonomous looping until clean verification is reached.

---

## 📄 Raw System Prompt Configurations

### 1. `CLAUDE.md` / `SKILL.md` Core Instructions

```markdown
# CLAUDE.md / SKILL.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
```

### 2. Cursor IDE Rule File (`.cursor/rules/karpathy-guidelines.mdc`)

```yaml
---
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
alwaysApply: true
---
```

---

## 🛠️ Real-World Code Examples & Anti-Patterns

### 1. Think Before Coding

#### Example A: Hidden Assumptions
**User Request:** *"Add a feature to export user data"*

❌ **Wrong (Hidden Assumptions):**
```python
def export_users(format='json'):
    """Export all users to a file."""
    users = User.query.all()
    
    if format == 'json':
        with open('users.json', 'w') as f:
            json.dump([u.to_dict() for u in users], f)
    elif format == 'csv':
        with open('users.csv', 'w') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'email', 'name'])
            writer.writeheader()
            writer.writerows([u.to_dict() for u in users])
    
    return f"Exported {len(users)} users"
```

✅ **Correct (Surface Assumptions):**
> Before implementing, I need to clarify:
> 1. **Scope**: Export all users or filtered subset? (privacy/performance)
> 2. **Format**: Download file in browser, background job with email, or API endpoint?
> 3. **Fields**: Which user fields are needed? (avoid leaking sensitive fields)
> 4. **Volume**: How many users typically?

---

### 2. Simplicity First

#### Example A: Over-Abstraction
**User Request:** *"Add a function to calculate discount"*

❌ **Wrong (Overengineered):**
```python
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: float) -> float: pass

class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float): self.percentage = percentage
    def calculate(self, amount: float) -> float: return amount * (self.percentage / 100)

class DiscountCalculator:
    def __init__(self, strategy: DiscountStrategy): self.strategy = strategy
    def apply_discount(self, amount: float) -> float: return self.strategy.calculate(amount)
```

✅ **Correct (Simple):**
```python
def calculate_discount(amount: float, percent: float) -> float:
    """Calculate discount amount. percent should be 0-100."""
    return amount * (percent / 100)
```

---

### 3. Surgical Changes

#### Example A: Drive-By Refactoring
**User Request:** *"Fix the bug where empty emails crash the validator"*

❌ **Wrong (Touching Unrelated Code):**
```diff
  def validate_user(user_data):
-     # Check email format
-     if not user_data.get('email'):
+     """Validate user data."""
+     email = user_data.get('email', '').strip()
+     if not email:
          raise ValueError("Email required")
+     if '@' not in email or '.' not in email.split('@')[1]:
+         raise ValueError("Invalid email")
      
-     # Check username
-     if not user_data.get('username'):
+     # Validate username
+     username = user_data.get('username', '').strip()
+     if not username:
+         raise ValueError("Username required")
```

✅ **Correct (Surgical Fix):**
```diff
  def validate_user(user_data):
      # Check email format
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email required")
      
      # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Invalid email")
```

---

### 4. Goal-Driven Execution

#### Example A: Test-First Bug Fix
**User Request:** *"The sorting breaks when there are duplicate scores"*

✅ **Correct (Reproduce First, Then Fix):**
```python
# Step 1: Write reproducing test
def test_sort_with_duplicate_scores():
    scores = [
        {'name': 'Alice', 'score': 100},
        {'name': 'Bob', 'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]
    result = sort_scores(scores)
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100

# Step 2: Implement fix
def sort_scores(scores):
    """Sort by score descending, then name ascending for ties."""
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
```

---

## 📊 Summary of Anti-Patterns & Fixes

| Principle | Anti-Pattern | Fix |
| :--- | :--- | :--- |
| **Think Before Coding** | Silently assumes file format, scope, fields | List assumptions explicitly; ask for clarification |
| **Simplicity First** | Strategy pattern for single calculation | Single function until complexity is explicitly required |
| **Surgical Changes** | Reformats quotes, adds type hints while fixing bug | Change only the lines that fix the reported issue |
| **Goal-Driven** | *"I'll review and improve the code"* | *"Write test for bug X → make it pass → verify no regressions"* |

---

## ⚙️ How to Install & Use

### Option 1: Claude Code Plugin
```bash
/plugin marketplace add forrestchang/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

### Option 2: Project-Specific `CLAUDE.md`
```bash
curl -o CLAUDE.md https://raw.githubusercontent.com/forrestchang/andrej-karpathy-skills/main/CLAUDE.md
```

### Option 3: Cursor IDE
Copy `.cursor/rules/karpathy-guidelines.mdc` into your project's `.cursor/rules/` directory with `alwaysApply: true`.

---

*Extracted from [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills.git).*
