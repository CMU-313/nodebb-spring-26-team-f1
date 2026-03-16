import { fuzzArg, fuzzMethod } from 'fast-fuzz-shim/dist/fast-fuzz';

export class UserInputFuzzTarget {
	@fuzzMethod
	validateUsername(
		@fuzzArg('string', 0, 0, 80) username: string
	): boolean {
		const trimmed = username.trim();
		if (!trimmed) {
			throw new Error('username-empty');
		}
		if (trimmed.length < 3 || trimmed.length > 16) {
			throw new Error('username-length-invalid');
		}
		if (!/^[a-zA-Z0-9_\-.]+$/.test(trimmed)) {
			throw new Error('username-char-invalid');
		}
		if (/([_.-])\1/.test(trimmed)) {
			throw new Error('username-repeated-separator');
		}
		return true;
	}

	@fuzzMethod
	validateEmail(
		@fuzzArg('string', 0, 0, 120) email: string
	): boolean {
		const trimmed = email.trim();
		if (!trimmed) {
			throw new Error('email-empty');
		}
		if (trimmed.length > 100) {
			throw new Error('email-too-long');
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
			throw new Error('email-invalid-format');
		}
		return true;
	}

	@fuzzMethod
	validateBio(
		@fuzzArg('string', 0, 0, 512) bio: string
	): boolean {
		if (bio.length > 500) {
			throw new Error('bio-too-long');
		}
		if (/<\s*script/gi.test(bio)) {
			throw new Error('bio-script-tag');
		}
		return true;
	}
}
