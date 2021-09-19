export type OFileQuality = 0 | 1 | 2 | 3;
export type OFileAliasInfo = {
	file_id: string;
	file_key: string;
};

export type OFileMarked = (Blob | File) & {
	oz_mark_file_id?:string,
	oz_mark_file_key?:string,
};

export default class OWebFS {
	static readonly OFA_MIME_TYPE = 'text/x-ozone-file-alias';

	/**
	 * Checks for file object.
	 *
	 * @param f
	 */
	static isFile(f: unknown): f is OFileMarked {
		return f instanceof Blob || f instanceof File;
	}

	/**
	 * Checks for marked file object.
	 * @param f
	 */
	static isMarkedFile(f: unknown): boolean {
		return Boolean(OWebFS.isFile(f) && f.oz_mark_file_id && f.oz_mark_file_key);
	}

	/**
	 * Creates O'Zone file alias.
	 *
	 * @param info
	 */
	static createFileAlias(info: OFileAliasInfo): File {
		const fileName = info.file_id + '.ofa',
			  content  = JSON.stringify({
				  'file_id' : info.file_id,
				  'file_key': info.file_key,
			  }),
			  b        = new Blob([content], {type: OWebFS.OFA_MIME_TYPE});

		return new File([b], fileName, {type: b.type});
	}
}
