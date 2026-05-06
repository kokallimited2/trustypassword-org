// Password Generator
class PasswordGenerator {
    constructor() {
        this.uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.lowercase = 'abcdefghijklmnopqrstuvwxyz';
        this.numbers = '0123456789';
        this.symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.ambiguous = 'il1Lo0O';
    }
    generate(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous) {
        const crypto = window.crypto || window.msCrypto;
        if (!crypto) return this._fallbackGenerate(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous);
        let chars = '';
        if (useUpper) chars += this.uppercase;
        if (useLower) chars += this.lowercase;
        if (useNumbers) chars += this.numbers;
        if (useSymbols) chars += this.symbols;
        if (!chars) return '';
        if (excludeAmbiguous) chars = [...chars].filter(c => !this.ambiguous.includes(c)).join('');
        let password = '';
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            password += chars[randomValues[i] % chars.length];
        }
        return password;
    }
    _fallbackGenerate(length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous) {
        let chars = '';
        if (useUpper) chars += this.uppercase;
        if (useLower) chars += this.lowercase;
        if (useNumbers) chars += this.numbers;
        if (useSymbols) chars += this.symbols;
        if (!chars) return '';
        if (excludeAmbiguous) chars = [...chars].filter(c => !this.ambiguous.includes(c)).join('');
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    }
}

// Password Strength Checker
class PasswordStrengthChecker {
    check(password) {
        const length = password.length;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        const types = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
        let score = 0;
        score += Math.min(length * 4, 40);
        score += types * 15;
        if (hasUpper && hasLower) score += 10;
        if (hasNumber) score += 5;
        if (hasSymbol) score += 10;
        if (this._hasRepeating(password)) score -= 10;
        if (this._isCommonPassword(password)) score -= 20;
        if (this._hasSequence(password)) score -= 10;
        score = Math.max(0, Math.min(100, score));

        let strength = 'Very Weak';
        let color = '#EF4444';
        let time = 'Instantly';
        if (score >= 80) { strength = 'Very Strong'; color = '#10B981'; time = this._formatTime(Math.pow(62, length) / 7e9); }
        else if (score >= 60) { strength = 'Strong'; color = '#34D399'; time = this._formatTime(Math.pow(52, length) / 7e8); }
        else if (score >= 40) { strength = 'Medium'; color = '#F59E0B'; time = this._formatTime(Math.pow(36, length) / 7e5); }
        else if (score >= 20) { strength = 'Weak'; color = '#F97316'; time = this._formatTime(Math.pow(26, length) / 7e3); }

        const variety = types === 4 ? 'Excellent' : types === 3 ? 'Good' : types === 2 ? 'Fair' : 'Poor';
        const patterns = [];
        if (this._hasRepeating(password)) patterns.push('Repeating chars');
        if (this._isCommonPassword(password)) patterns.push('Common password');
        if (this._hasSequence(password)) patterns.push('Sequential chars');
        if (patterns.length === 0) patterns.push('None detected');
        
        const tips = [];
        if (length < 12) tips.push('Use at least 12 characters');
        if (types < 3) tips.push('Include more character types');
        if (this._hasRepeating(password)) tips.push('Avoid repeating characters');
        if (this._isCommonPassword(password)) tips.push('This is a commonly used password');
        if (this._hasSequence(password)) tips.push('Avoid sequential characters');
        if (length < 16) tips.push('Aim for 16+ characters for critical accounts');

        return { score, strength, color, time, variety, patterns: patterns.join(', '), tips };
    }
    _hasRepeating(s) { return /(.)\1{2,}/.test(s); }
    _hasSequence(s) { return /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(s); }
    _isCommonPassword(s) {
        const common = ['password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'letmein', 'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine', 'master', 'welcome', 'shadow', 'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang', 'password1'];
        return common.some(p => s.toLowerCase().includes(p));
    }
    _formatTime(seconds) {
        if (seconds < 1) return 'Instantly';
        if (seconds < 60) return Math.round(seconds) + ' seconds';
        if (seconds < 3600) return Math.round(seconds/60) + ' minutes';
        if (seconds < 86400) return Math.round(seconds/3600) + ' hours';
        if (seconds < 31536000) return Math.round(seconds/86400) + ' days';
        const years = seconds / 31536000;
        if (years < 1000) return Math.round(years) + ' years';
        if (years < 1e6) return Math.round(years/1e3) + ' thousand years';
        if (years < 1e9) return Math.round(years/1e6) + ' million years';
        return Math.round(years/1e9) + ' billion years';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const gen = new PasswordGenerator();
    const checker = new PasswordStrengthChecker();
    const display = document.getElementById('password-display');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const slider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const checkInput = document.getElementById('strength-check-input');
    const toggleVis = document.getElementById('toggle-visibility');

    generateBtn.addEventListener('click', () => {
        const pwd = gen.generate(
            parseInt(slider.value),
            document.getElementById('include-uppercase').checked,
            document.getElementById('include-lowercase').checked,
            document.getElementById('include-numbers').checked,
            document.getElementById('include-symbols').checked,
            document.getElementById('exclude-ambiguous').checked
        );
        display.value = pwd;
    });

    slider.addEventListener('input', () => { lengthDisplay.textContent = slider.value; });

    copyBtn.addEventListener('click', () => {
        if (!display.value) return;
        navigator.clipboard.writeText(display.value).then(() => {
            copyBtn.textContent = '✅';
            setTimeout(() => { copyBtn.textContent = '📋'; }, 1500);
        });
    });

    checkInput.addEventListener('input', () => {
        const pwd = checkInput.value;
        if (!pwd) {
            document.getElementById('report-length').textContent = '0 chars';
            document.getElementById('report-variety').textContent = 'None';
            document.getElementById('report-patterns').textContent = 'None';
            document.getElementById('report-time').textContent = 'Instantly';
            const el = document.getElementById('report-strength');
            el.textContent = 'Very Weak';
            el.className = 'report-value strength-very-weak';
            return;
        }
        const result = checker.check(pwd);
        document.getElementById('report-length').textContent = pwd.length + ' chars';
        document.getElementById('report-variety').textContent = result.variety;
        document.getElementById('report-patterns').textContent = result.patterns;
        document.getElementById('report-time').textContent = result.time;
        const el = document.getElementById('report-strength');
        el.textContent = result.strength;
        el.style.color = result.color;
    });

    toggleVis.addEventListener('click', () => {
        const isPassword = checkInput.type === 'password';
        checkInput.type = isPassword ? 'text' : 'password';
        toggleVis.textContent = isPassword ? '🙈' : '👁️';
    });
});
