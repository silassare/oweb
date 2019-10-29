import PathResolver from "./utils/PathResolver";
let isServerUrl = function (url_key) {
    return /^OZ_SERVER_/.test(url_key);
}, isLocalUrl = function (url_key) {
    return /^OW_LOCAL_/.test(url_key);
};
export default class OWebUrl {
    constructor(context, url_list) {
        this._url_list = url_list;
        this._url_local_base = context.configs.get("OW_APP_LOCAL_BASE_URL");
        this._url_server_base = context.configs.get("OZ_API_BASE_URL");
        console.log("[OWebUrl] ready!");
    }
    /**
     * Gets url value with a given url key name.
     *
     * @param key The url key name.
     */
    get(key) {
        let url = this._url_list[key];
        if (!url) {
            throw new Error(`[OWebUrl] url key "${key}" is not defined.`);
        }
        if (isServerUrl(key))
            return this.resolveServer(url);
        if (isLocalUrl(key))
            return this.resolveLocal(url);
        return url;
    }
    /**
     * Resolve url with local base.
     *
     * @param url
     */
    resolveLocal(url) {
        return PathResolver.resolve(this._url_local_base, url);
    }
    /**
     * Resolve url with server base.
     *
     * @param url
     */
    resolveServer(url) {
        return PathResolver.resolve(this._url_server_base, url);
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViVXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBRWhELElBQUksV0FBVyxHQUFHLFVBQVUsT0FBZTtJQUMxQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxFQUFFLFVBQVUsR0FBSyxVQUFVLE9BQWU7SUFDMUMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUlGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUszQixZQUFZLE9BQWdCLEVBQUUsUUFBa0I7UUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBVSxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLGVBQWUsR0FBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRS9ELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxHQUFXO1FBQ2QsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEdBQVc7UUFDdkIsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsR0FBVztRQUN4QixPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDRDtBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi9PV2ViQXBwXCI7XHJcbmltcG9ydCBQYXRoUmVzb2x2ZXIgZnJvbSBcIi4vdXRpbHMvUGF0aFJlc29sdmVyXCI7XHJcblxyXG5sZXQgaXNTZXJ2ZXJVcmwgPSBmdW5jdGlvbiAodXJsX2tleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcblx0cmV0dXJuIC9eT1pfU0VSVkVSXy8udGVzdCh1cmxfa2V5KTtcclxufSwgaXNMb2NhbFVybCAgID0gZnVuY3Rpb24gKHVybF9rZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXk9XX0xPQ0FMXy8udGVzdCh1cmxfa2V5KTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIHRVcmxMaXN0ID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJVcmwge1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybF9saXN0OiB0VXJsTGlzdDtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxfbG9jYWxfYmFzZTogc3RyaW5nO1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybF9zZXJ2ZXJfYmFzZTogc3RyaW5nO1xyXG5cclxuXHRjb25zdHJ1Y3Rvcihjb250ZXh0OiBPV2ViQXBwLCB1cmxfbGlzdDogdFVybExpc3QpIHtcclxuXHRcdHRoaXMuX3VybF9saXN0ICAgICAgICA9IHVybF9saXN0O1xyXG5cdFx0dGhpcy5fdXJsX2xvY2FsX2Jhc2UgID0gY29udGV4dC5jb25maWdzLmdldChcIk9XX0FQUF9MT0NBTF9CQVNFX1VSTFwiKTtcclxuXHRcdHRoaXMuX3VybF9zZXJ2ZXJfYmFzZSA9IGNvbnRleHQuY29uZmlncy5nZXQoXCJPWl9BUElfQkFTRV9VUkxcIik7XHJcblxyXG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYlVybF0gcmVhZHkhXCIpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogR2V0cyB1cmwgdmFsdWUgd2l0aCBhIGdpdmVuIHVybCBrZXkgbmFtZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBrZXkgVGhlIHVybCBrZXkgbmFtZS5cclxuXHQgKi9cclxuXHRnZXQoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0bGV0IHVybDogc3RyaW5nID0gdGhpcy5fdXJsX2xpc3Rba2V5XTtcclxuXHJcblx0XHRpZiAoIXVybCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViVXJsXSB1cmwga2V5IFwiJHtrZXl9XCIgaXMgbm90IGRlZmluZWQuYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGlzU2VydmVyVXJsKGtleSkpIHJldHVybiB0aGlzLnJlc29sdmVTZXJ2ZXIodXJsKTtcclxuXHRcdGlmIChpc0xvY2FsVXJsKGtleSkpIHJldHVybiB0aGlzLnJlc29sdmVMb2NhbCh1cmwpO1xyXG5cclxuXHRcdHJldHVybiB1cmw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNvbHZlIHVybCB3aXRoIGxvY2FsIGJhc2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXJsXHJcblx0ICovXHJcblx0cmVzb2x2ZUxvY2FsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBQYXRoUmVzb2x2ZXIucmVzb2x2ZSh0aGlzLl91cmxfbG9jYWxfYmFzZSwgdXJsKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc29sdmUgdXJsIHdpdGggc2VydmVyIGJhc2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXJsXHJcblx0ICovXHJcblx0cmVzb2x2ZVNlcnZlcih1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gUGF0aFJlc29sdmVyLnJlc29sdmUodGhpcy5fdXJsX3NlcnZlcl9iYXNlLCB1cmwpO1xyXG5cdH1cclxufTsiXX0=