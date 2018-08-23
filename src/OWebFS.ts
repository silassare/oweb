export type tFileAliasInfo = {
	file_id: string,
	file_key: string
}

export default class OWebFS {
	static readonly OFA_MIME_TYPE = "text/x-ozone-file-alias";

	static isFile(f: any): boolean {
		return (f instanceof Blob || f instanceof File);
	}

	static isMarkedFile(f: any): boolean {
		return OWebFS.isFile(f) && f["oz_mark_file_id"] && f["oz_mark_file_key"];
	}

	static createFileAlias(info: tFileAliasInfo): File {
		let file_name = info.file_id + ".ofa",
			content   = JSON.stringify({
				"file_id" : info.file_id,
				"file_key": info.file_key
			}),
			b         = new Blob([content], {type: OWebFS.OFA_MIME_TYPE});

		return new File([b], file_name, {type: b.type});
	}
}