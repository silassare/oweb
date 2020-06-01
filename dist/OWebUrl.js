import PathResolver from './utils/PathResolver';
import { _info } from './utils/Utils';
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
        _info('[OWebUrl] ready!');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlVybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViVXJsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sWUFBWSxNQUFNLHNCQUFzQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdEMsTUFBTSxXQUFXLEdBQUcsVUFBVSxNQUFjO0lBQzFDLE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNuQyxDQUFDLEVBQ0QsVUFBVSxHQUFHLFVBQVUsTUFBYztJQUNwQyxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsQ0FBQyxDQUFDO0FBSUgsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUFPO0lBSzNCLFlBQVksT0FBZ0IsRUFBRSxPQUFpQjtRQUM5QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRTdELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLEdBQVc7UUFDZCxNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixHQUFHLG1CQUFtQixDQUFDLENBQUM7U0FDOUQ7UUFFRCxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckQsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRW5ELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsR0FBVztRQUN2QixPQUFPLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxHQUFXO1FBQ3hCLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XHJcbmltcG9ydCBQYXRoUmVzb2x2ZXIgZnJvbSAnLi91dGlscy9QYXRoUmVzb2x2ZXInO1xyXG5pbXBvcnQgeyBfaW5mbyB9IGZyb20gJy4vdXRpbHMvVXRpbHMnO1xyXG5cclxuY29uc3QgaXNTZXJ2ZXJVcmwgPSBmdW5jdGlvbiAodXJsS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAvXk9aX1NFUlZFUl8vLnRlc3QodXJsS2V5KTtcclxuXHR9LFxyXG5cdGlzTG9jYWxVcmwgPSBmdW5jdGlvbiAodXJsS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiAvXk9XX0xPQ0FMXy8udGVzdCh1cmxLZXkpO1xyXG5cdH07XHJcblxyXG5leHBvcnQgdHlwZSB0VXJsTGlzdCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViVXJsIHtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxMaXN0OiB0VXJsTGlzdDtcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxMb2NhbEJhc2U6IHN0cmluZztcclxuXHRwcml2YXRlIHJlYWRvbmx5IF91cmxTZXJ2ZXJCYXNlOiBzdHJpbmc7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGNvbnRleHQ6IE9XZWJBcHAsIHVybExpc3Q6IHRVcmxMaXN0KSB7XHJcblx0XHR0aGlzLl91cmxMaXN0ID0gdXJsTGlzdDtcclxuXHRcdHRoaXMuX3VybExvY2FsQmFzZSA9IGNvbnRleHQuY29uZmlncy5nZXQoJ09XX0FQUF9MT0NBTF9CQVNFX1VSTCcpO1xyXG5cdFx0dGhpcy5fdXJsU2VydmVyQmFzZSA9IGNvbnRleHQuY29uZmlncy5nZXQoJ09aX0FQSV9CQVNFX1VSTCcpO1xyXG5cclxuXHRcdF9pbmZvKCdbT1dlYlVybF0gcmVhZHkhJyk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBHZXRzIHVybCB2YWx1ZSB3aXRoIGEgZ2l2ZW4gdXJsIGtleSBuYW1lLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGtleSBUaGUgdXJsIGtleSBuYW1lLlxyXG5cdCAqL1xyXG5cdGdldChrZXk6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRjb25zdCB1cmw6IHN0cmluZyA9IHRoaXMuX3VybExpc3Rba2V5XTtcclxuXHJcblx0XHRpZiAoIXVybCkge1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViVXJsXSB1cmwga2V5IFwiJHtrZXl9XCIgaXMgbm90IGRlZmluZWQuYCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGlzU2VydmVyVXJsKGtleSkpIHJldHVybiB0aGlzLnJlc29sdmVTZXJ2ZXIodXJsKTtcclxuXHRcdGlmIChpc0xvY2FsVXJsKGtleSkpIHJldHVybiB0aGlzLnJlc29sdmVMb2NhbCh1cmwpO1xyXG5cclxuXHRcdHJldHVybiB1cmw7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNvbHZlIHVybCB3aXRoIGxvY2FsIGJhc2UuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gdXJsXHJcblx0ICovXHJcblx0cmVzb2x2ZUxvY2FsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcclxuXHRcdHJldHVybiBQYXRoUmVzb2x2ZXIucmVzb2x2ZSh0aGlzLl91cmxMb2NhbEJhc2UsIHVybCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBSZXNvbHZlIHVybCB3aXRoIHNlcnZlciBiYXNlLlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHVybFxyXG5cdCAqL1xyXG5cdHJlc29sdmVTZXJ2ZXIodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0cmV0dXJuIFBhdGhSZXNvbHZlci5yZXNvbHZlKHRoaXMuX3VybFNlcnZlckJhc2UsIHVybCk7XHJcblx0fVxyXG59XHJcbiJdfQ==