# Contributing to Real-Time Phishing Detection Extension

First off, thank you for considering contributing to our phishing detection extension! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RTPDBE.git
   cd RTPDBE
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue list](https://github.com/Raoof128/RTPDBE/issues) to avoid duplicates.

When creating a bug report, include:
- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Browser and version**
- **Extension version**
- **Console logs** (filter by `[Phishing Detection]`)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:
- **Clear title and description**
- **Use case** - why is this needed?
- **Proposed solution**
- **Alternative solutions** you've considered
- **Examples** from other extensions (if applicable)

### Contributing Code

We love pull requests! Here's how to contribute code:

1. **Check existing issues** - someone might already be working on it
2. **Create an issue first** for significant changes
3. **Follow coding guidelines** (see below)
4. **Write tests** if applicable
5. **Update documentation** as needed
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Git
- Node.js (for development tools)
- A Chromium-based browser or Firefox
- Text editor or IDE

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/RTPDBE.git
   cd RTPDBE
   ```

2. Install development dependencies (optional):
   ```bash
   npm install
   ```

3. Generate icons (if needed):
   ```bash
   node generate-icons.js
   # OR open icons/generate-icons.html in browser
   ```

4. Load extension in browser:
   - **Chrome**: Navigate to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select RTPDBE folder
   - **Firefox**: Navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select manifest.json

### Development Workflow

1. Make your changes
2. Test thoroughly (see [TESTING.md](TESTING.md))
3. Check console for errors
4. Lint your code (if eslint is set up):
   ```bash
   npm run lint
   ```
5. Commit your changes
6. Push to your fork
7. Create a Pull Request

## Coding Guidelines

### JavaScript Style

- **Use strict mode**: `'use strict';` at the top of files
- **ES6+ features**: Use modern JavaScript (const/let, arrow functions, etc.)
- **Error handling**: Always use try-catch for async operations
- **Logging**: Use `console.log('[Phishing Detection] ...')` prefix
- **Comments**: Use JSDoc for functions

### Code Structure

```javascript
/**
 * Brief description of function
 * @param {Type} paramName - Parameter description
 * @returns {Type} - Return value description
 */
function myFunction(paramName) {
  try {
    // Implementation
  } catch (error) {
    console.error('[Phishing Detection] Error:', error);
  }
}
```

### Security Guidelines

- **Never use `innerHTML`** with user input - use `textContent` or `escapeHTML()`
- **Always validate inputs** - especially URLs and user data
- **Check `chrome.runtime.lastError`** after all Chrome API calls
- **Use try-catch** around all async operations
- **Sanitize data** before storing or displaying

### Performance Guidelines

- **Minimize DOM operations** - batch updates when possible
- **Use debouncing** for frequent operations
- **Avoid synchronous storage** operations in loops
- **Clean up** observers and event listeners

## Commit Messages

We follow a structured commit message format:

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat: Add detection for URL shorteners

- Added detection for bit.ly, tinyurl.com, etc.
- Increases suspicion score by 10
- Updated PHISHING_KEYWORDS array

Closes #42
```

```
fix: Prevent XSS in popup blocked sites list

- Changed innerHTML to textContent
- Added escapeHTML() utility function
- Sanitized all user-controlled data

Security fix for CVE-XXXX-XXXX
```

## Pull Request Process

### Before Submitting

1. ✅ **Test your changes** thoroughly
2. ✅ **Update documentation** if needed
3. ✅ **Add tests** if applicable
4. ✅ **Run linter** (if available)
5. ✅ **Check for console errors**
6. ✅ **Update CHANGELOG.md** under [Unreleased]

### PR Checklist

Your PR should include:

- [ ] Clear description of changes
- [ ] Link to related issue (if applicable)
- [ ] Screenshots/GIFs for UI changes
- [ ] Test results or testing instructions
- [ ] Documentation updates
- [ ] CHANGELOG.md updated

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Testing
Describe how you tested these changes

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, it will be merged
4. Your contribution will be credited in releases

## Reporting Bugs

### Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md) for responsible disclosure.

### Regular Bugs

Use the bug report template and include:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- Browser: [e.g., Chrome 120]
- Extension Version: [e.g., 1.0.1]
- OS: [e.g., Windows 11]

**Console Logs**
```
Paste console logs here (filtered by [Phishing Detection])
```

**Additional context**
Any other relevant information
```

## Suggesting Enhancements

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of what you want

**Describe alternatives you've considered**
Other solutions you've thought about

**Use cases**
Real-world scenarios where this would be useful

**Additional context**
Screenshots, mockups, examples from other extensions
```

## Testing

See [TESTING.md](TESTING.md) for comprehensive testing guidelines.

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Extension loads without errors
- [ ] All features work as expected
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Edge cases handled
- [ ] Works in target browsers
- [ ] Documentation is accurate

### Automated Testing

If you're adding automated tests:

```bash
npm test
```

## Areas Where We Need Help

We especially welcome contributions in these areas:

1. **Testing**: Write automated tests
2. **Documentation**: Improve docs, add examples
3. **Localization**: Translate to other languages
4. **Detection Rules**: Improve phishing detection algorithms
5. **UI/UX**: Improve user interface and experience
6. **Performance**: Optimize code for better performance
7. **Browser Compatibility**: Test and fix issues on different browsers

## Recognition

Contributors will be:
- Listed in CHANGELOG.md for their contributions
- Credited in release notes
- Added to a CONTRIBUTORS.md file (if created)

## Questions?

- Check [existing issues](https://github.com/Raoof128/RTPDBE/issues)
- Read the [documentation](README.md)
- Create a new issue with the "question" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to making the internet safer! 🛡️
