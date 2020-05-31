import PathResolver from './utils/PathResolver';
const isServerUrl = function (urlKey) {
    return /^OZ_SERVER_/.test(urlKey);
}, isLocalUrl = function (urlKey) {
    return /^OW_LOCAL_/.test(urlKey);
};
export default class OWebUrl {
    constructor(context, urlList) {
        this._urlList = urlList;
        this._urlLocalBase = context.configs.get('OW_APP_LOCAL_BASE_URL');
        this._urlServerBase = context.configs.get('OZ_API_BASE_URL');
        console.log('[OWebUrl] ready!');
    }
    /**
     * Gets url value with a given url key name.
     *
     * @param key The url key name.
     */
    get(key) {
        const url = this._urlList[key];
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
        return PathResolver.resolve(this._urlLocalBase, url);
    }
    /**
     * Resolve url with server base.
     *
     * @param url
     */
    resolveServer(url) {
        return PathResolver.resolve(this._urlServerBase, url);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViVXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBRWhELE1BQU0sV0FBVyxHQUFHLFVBQVUsTUFBYztJQUMxQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkMsQ0FBQyxFQUNELFVBQVUsR0FBRyxVQUFVLE1BQWM7SUFDcEMsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQztBQUlILE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUszQixZQUFZLE9BQWdCLEVBQUUsT0FBaUI7UUFDOUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUU3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxHQUFHLENBQUMsR0FBVztRQUNkLE1BQU0sR0FBRyxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLEdBQUcsbUJBQW1CLENBQUMsQ0FBQztTQUM5RDtRQUVELElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFbkQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLEdBQVc7UUFDeEIsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcclxuaW1wb3J0IFBhdGhSZXNvbHZlciBmcm9tICcuL3V0aWxzL1BhdGhSZXNvbHZlcic7XHJcblxyXG5jb25zdCBpc1NlcnZlclVybCA9IGZ1bmN0aW9uICh1cmxLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIC9eT1pfU0VSVkVSXy8udGVzdCh1cmxLZXkpO1xyXG5cdH0sXHJcblx0aXNMb2NhbFVybCA9IGZ1bmN0aW9uICh1cmxLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIC9eT1dfTE9DQUxfLy50ZXN0KHVybEtleSk7XHJcblx0fTtcclxuXHJcbmV4cG9ydCB0eXBlIHRVcmxMaXN0ID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJVcmwge1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybExpc3Q6IHRVcmxMaXN0O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybExvY2FsQmFzZTogc3RyaW5nO1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybFNlcnZlckJhc2U6IHN0cmluZztcclxuXHJcblx0Y29uc3RydWN0b3IoY29udGV4dDogT1dlYkFwcCwgdXJsTGlzdDogdFVybExpc3QpIHtcclxuXHRcdHRoaXMuX3VybExpc3QgPSB1cmxMaXN0O1xyXG5cdFx0dGhpcy5fdXJsTG9jYWxCYXNlID0gY29udGV4dC5jb25maWdzLmdldCgnT1dfQVBQX0xPQ0FMX0JBU0VfVVJMJyk7XHJcblx0XHR0aGlzLl91cmxTZXJ2ZXJCYXNlID0gY29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0JBU0VfVVJMJyk7XHJcblxyXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViVXJsXSByZWFkeSEnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdXJsIHZhbHVlIHdpdGggYSBnaXZlbiB1cmwga2V5IG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSB1cmwga2V5IG5hbWUuXHJcblx0ICovXHJcblx0Z2V0KGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHVybDogc3RyaW5nID0gdGhpcy5fdXJsTGlzdFtrZXldO1xyXG5cclxuXHRcdGlmICghdXJsKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJVcmxdIHVybCBrZXkgXCIke2tleX1cIiBpcyBub3QgZGVmaW5lZC5gKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoaXNTZXJ2ZXJVcmwoa2V5KSkgcmV0dXJuIHRoaXMucmVzb2x2ZVNlcnZlcih1cmwpO1xyXG5cdFx0aWYgKGlzTG9jYWxVcmwoa2V5KSkgcmV0dXJuIHRoaXMucmVzb2x2ZUxvY2FsKHVybCk7XHJcblxyXG5cdFx0cmV0dXJuIHVybDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc29sdmUgdXJsIHdpdGggbG9jYWwgYmFzZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1cmxcclxuXHQgKi9cclxuXHRyZXNvbHZlTG9jYWwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFBhdGhSZXNvbHZlci5yZXNvbHZlKHRoaXMuX3VybExvY2FsQmFzZSwgdXJsKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc29sdmUgdXJsIHdpdGggc2VydmVyIGJhc2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXJsXHJcblx0ICovXHJcblx0cmVzb2x2ZVNlcnZlcih1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gUGF0aFJlc29sdmVyLnJlc29sdmUodGhpcy5fdXJsU2VydmVyQmFzZSwgdXJsKTtcclxuXHR9XHJcbn1cclxuIl19