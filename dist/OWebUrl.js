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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViVXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBRWhELElBQUksV0FBVyxHQUFHLFVBQVUsT0FBZTtJQUMxQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQyxFQUFFLFVBQVUsR0FBSyxVQUFVLE9BQWU7SUFDMUMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLENBQUMsQ0FBQztBQUlGLE1BQU0sQ0FBQyxPQUFPO0lBS2IsWUFBWSxPQUFnQixFQUFFLFFBQWtCO1FBQy9DLElBQUksQ0FBQyxTQUFTLEdBQVUsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUUvRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLENBQUMsR0FBVztRQUNkLElBQUksR0FBRyxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLEdBQUcsbUJBQW1CLENBQUMsQ0FBQztTQUM5RDtRQUVELElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLEdBQVc7UUFDeEIsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0Q7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSBcIi4vT1dlYkFwcFwiO1xyXG5pbXBvcnQgUGF0aFJlc29sdmVyIGZyb20gXCIuL3V0aWxzL1BhdGhSZXNvbHZlclwiO1xyXG5cclxubGV0IGlzU2VydmVyVXJsID0gZnVuY3Rpb24gKHVybF9rZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdHJldHVybiAvXk9aX1NFUlZFUl8vLnRlc3QodXJsX2tleSk7XHJcbn0sIGlzTG9jYWxVcmwgICA9IGZ1bmN0aW9uICh1cmxfa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRyZXR1cm4gL15PV19MT0NBTF8vLnRlc3QodXJsX2tleSk7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSB0VXJsTGlzdCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVXJsIHtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxfbGlzdDogdFVybExpc3Q7XHJcblx0cHJpdmF0ZSByZWFkb25seSBfdXJsX2xvY2FsX2Jhc2U6IHN0cmluZztcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxfc2VydmVyX2Jhc2U6IHN0cmluZztcclxuXHJcblx0Y29uc3RydWN0b3IoY29udGV4dDogT1dlYkFwcCwgdXJsX2xpc3Q6IHRVcmxMaXN0KSB7XHJcblx0XHR0aGlzLl91cmxfbGlzdCAgICAgICAgPSB1cmxfbGlzdDtcclxuXHRcdHRoaXMuX3VybF9sb2NhbF9iYXNlICA9IGNvbnRleHQuY29uZmlncy5nZXQoXCJPV19BUFBfTE9DQUxfQkFTRV9VUkxcIik7XHJcblx0XHR0aGlzLl91cmxfc2VydmVyX2Jhc2UgPSBjb250ZXh0LmNvbmZpZ3MuZ2V0KFwiT1pfQVBJX0JBU0VfVVJMXCIpO1xyXG5cclxuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJVcmxdIHJlYWR5IVwiKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdXJsIHZhbHVlIHdpdGggYSBnaXZlbiB1cmwga2V5IG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSB1cmwga2V5IG5hbWUuXHJcblx0ICovXHJcblx0Z2V0KGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGxldCB1cmw6IHN0cmluZyA9IHRoaXMuX3VybF9saXN0W2tleV07XHJcblxyXG5cdFx0aWYgKCF1cmwpIHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBbT1dlYlVybF0gdXJsIGtleSBcIiR7a2V5fVwiIGlzIG5vdCBkZWZpbmVkLmApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChpc1NlcnZlclVybChrZXkpKSByZXR1cm4gdGhpcy5yZXNvbHZlU2VydmVyKHVybCk7XHJcblx0XHRpZiAoaXNMb2NhbFVybChrZXkpKSByZXR1cm4gdGhpcy5yZXNvbHZlTG9jYWwodXJsKTtcclxuXHJcblx0XHRyZXR1cm4gdXJsO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogUmVzb2x2ZSB1cmwgd2l0aCBsb2NhbCBiYXNlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHVybFxyXG5cdCAqL1xyXG5cdHJlc29sdmVMb2NhbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gUGF0aFJlc29sdmVyLnJlc29sdmUodGhpcy5fdXJsX2xvY2FsX2Jhc2UsIHVybCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNvbHZlIHVybCB3aXRoIHNlcnZlciBiYXNlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHVybFxyXG5cdCAqL1xyXG5cdHJlc29sdmVTZXJ2ZXIodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFBhdGhSZXNvbHZlci5yZXNvbHZlKHRoaXMuX3VybF9zZXJ2ZXJfYmFzZSwgdXJsKTtcclxuXHR9XHJcbn07Il19