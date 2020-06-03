import PathResolver from './utils/PathResolver';
import { logger } from './utils/Utils';
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
        logger.info('[OWebUrl] ready!');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViVXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkMsTUFBTSxXQUFXLEdBQUcsVUFBVSxNQUFjO0lBQzFDLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDLEVBQ0QsVUFBVSxHQUFHLFVBQVUsTUFBYztJQUNwQyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDO0FBSUgsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBSzNCLFlBQVksT0FBZ0IsRUFBRSxPQUFpQjtRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRTdELE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxHQUFXO1FBQ2QsTUFBTSxHQUFHLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsWUFBWSxDQUFDLEdBQVc7UUFDdkIsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsR0FBVztRQUN4QixPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xyXG5pbXBvcnQgUGF0aFJlc29sdmVyIGZyb20gJy4vdXRpbHMvUGF0aFJlc29sdmVyJztcclxuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XHJcblxyXG5jb25zdCBpc1NlcnZlclVybCA9IGZ1bmN0aW9uICh1cmxLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIC9eT1pfU0VSVkVSXy8udGVzdCh1cmxLZXkpO1xyXG5cdH0sXHJcblx0aXNMb2NhbFVybCA9IGZ1bmN0aW9uICh1cmxLZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIC9eT1dfTE9DQUxfLy50ZXN0KHVybEtleSk7XHJcblx0fTtcclxuXHJcbmV4cG9ydCB0eXBlIHRVcmxMaXN0ID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJVcmwge1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybExpc3Q6IHRVcmxMaXN0O1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybExvY2FsQmFzZTogc3RyaW5nO1xyXG5cdHByaXZhdGUgcmVhZG9ubHkgX3VybFNlcnZlckJhc2U6IHN0cmluZztcclxuXHJcblx0Y29uc3RydWN0b3IoY29udGV4dDogT1dlYkFwcCwgdXJsTGlzdDogdFVybExpc3QpIHtcclxuXHRcdHRoaXMuX3VybExpc3QgPSB1cmxMaXN0O1xyXG5cdFx0dGhpcy5fdXJsTG9jYWxCYXNlID0gY29udGV4dC5jb25maWdzLmdldCgnT1dfQVBQX0xPQ0FMX0JBU0VfVVJMJyk7XHJcblx0XHR0aGlzLl91cmxTZXJ2ZXJCYXNlID0gY29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0JBU0VfVVJMJyk7XHJcblxyXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViVXJsXSByZWFkeSEnKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIEdldHMgdXJsIHZhbHVlIHdpdGggYSBnaXZlbiB1cmwga2V5IG5hbWUuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0ga2V5IFRoZSB1cmwga2V5IG5hbWUuXHJcblx0ICovXHJcblx0Z2V0KGtleTogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdGNvbnN0IHVybDogc3RyaW5nID0gdGhpcy5fdXJsTGlzdFtrZXldO1xyXG5cclxuXHRcdGlmICghdXJsKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJVcmxdIHVybCBrZXkgXCIke2tleX1cIiBpcyBub3QgZGVmaW5lZC5gKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoaXNTZXJ2ZXJVcmwoa2V5KSkgcmV0dXJuIHRoaXMucmVzb2x2ZVNlcnZlcih1cmwpO1xyXG5cdFx0aWYgKGlzTG9jYWxVcmwoa2V5KSkgcmV0dXJuIHRoaXMucmVzb2x2ZUxvY2FsKHVybCk7XHJcblxyXG5cdFx0cmV0dXJuIHVybDtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc29sdmUgdXJsIHdpdGggbG9jYWwgYmFzZS5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSB1cmxcclxuXHQgKi9cclxuXHRyZXNvbHZlTG9jYWwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFBhdGhSZXNvbHZlci5yZXNvbHZlKHRoaXMuX3VybExvY2FsQmFzZSwgdXJsKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdCAqIFJlc29sdmUgdXJsIHdpdGggc2VydmVyIGJhc2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXJsXHJcblx0ICovXHJcblx0cmVzb2x2ZVNlcnZlcih1cmw6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRyZXR1cm4gUGF0aFJlc29sdmVyLnJlc29sdmUodGhpcy5fdXJsU2VydmVyQmFzZSwgdXJsKTtcclxuXHR9XHJcbn1cclxuIl19