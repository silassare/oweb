"use strict";

let ls = window.localStorage;

let parse = function (data: string | null): any {
	let value: any = undefined;

	if (data !== null) {
		try {
			value = JSON.parse(data);
		} catch (e) {
			console.error(e);
		}
	}

	return value;
};

export default class OWebDataStore {

	static save(keyName: string, data: any): boolean {
		if (ls) {
			try {
				ls.setItem(keyName, JSON.stringify(data));
				return true;
			} catch (e) {
				console.error(e);
			}
		}

		return false;
	}

	static load(keyName: string): any {
		if (ls) {
			if (arguments[0] instanceof RegExp) {
				let keyReg      = arguments[0];
				let list        = Object.keys(ls);
				let result: any = {};

				for (let i = 0; i < list.length; i++) {
					let k = list[i];
					if (keyReg.test(k)) {
						result[k] = parse(ls.getItem(k));
					}
				}

				return result;

			} else {
				return parse(ls.getItem(keyName));
			}
		}

		return null;
	}

	static remove(keyName: string): boolean {
		if (ls) {
			if (arguments[0] instanceof RegExp) {
				let list   = Object.keys(ls);
				let keyReg = arguments[0];
				let count  = 0;

				for (let i = 0; i < list.length; i++) {
					let k = list[i];
					if (keyReg.test(k)) {
						ls.removeItem(k);
						count++;
					}
				}
			} else {
				ls.removeItem(keyName);
			}

			return true;
		}

		return false;
	}

	static clear(): boolean {
		return ls && !ls.clear() && true;
	}
};