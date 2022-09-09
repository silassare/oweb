export const globalRoot = (() => {
	if (
		typeof globalThis === 'object' &&
		globalThis !== null &&
		globalThis.Object === Object
	) {
		return globalThis;
	}

	if (
		typeof global === 'object' &&
		global !== null &&
		global.Object === Object
	) {
		return global;
	}

	if (typeof self === 'object' && self !== null && self.Object === Object) {
		return self;
	}

	return Function('return this')();
})();

export const supportRAF =
	typeof globalRoot.requestAnimationFrame === 'function';
