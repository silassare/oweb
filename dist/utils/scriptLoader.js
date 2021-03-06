import { callback, logger } from '.';
const document = window.document, isOldIE = /MSIE\s([5-9]\.0)/.test(navigator.userAgent);
if (typeof document !== 'object' ||
    typeof document.createElement !== 'function') {
    throw new Error('scriptLoader is for web use only');
}
export function noCache(url) {
    const _random = function () {
        return String(Math.random()).substring(2);
    };
    try {
        const u = new URL(url, window.location.href);
        u.searchParams.set('no_cache', _random());
        url = u.href;
    }
    catch (e) {
        logger.error('unable to disable caching on file', url, e);
    }
    return url;
}
export function loadScript(src, then, fail, disableCache = false) {
    if (!document.querySelector(`script[load-path='${src}']`)) {
        if (disableCache) {
            src = noCache(src);
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.type = 'text/javascript';
        script.onload = function () {
            callback(then, [src]);
        };
        script.onerror = function () {
            script.parentNode && script.parentNode.removeChild(script);
            callback(fail, [src]);
        };
        script.setAttribute('load-path', src);
        document.body.appendChild(script);
        // ie9 hack: to force script execution in order
        // since ie9 does not support script.async  = false;
        // https://github.com/h5bp/lazyweb-requests/issues/42#issue-1382146
        if (isOldIE) {
            document.body.appendChild(document.createElement('script'));
        }
    }
    else {
        callback(then, [src]);
    }
}
export function loadScriptBatch(list, then, disableCache = false) {
    const total = list.length;
    const failed = [];
    const done = [];
    let counter = 0;
    const updateCount = (success, src) => {
        counter++;
        (success ? done : failed).push(src);
        if (counter === total) {
            callback(then, [!failed.length, done, failed]);
        }
    };
    for (let i = 0; i < total; i++) {
        const src = list[i][0];
        const fn = list[i][1];
        if (typeof fn === 'function' && !fn()) {
            continue;
        }
        loadScript(src, (_src) => {
            updateCount(true, _src);
        }, (_src) => {
            updateCount(false, _src);
        }, disableCache);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0TG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3NjcmlwdExvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLEdBQUcsQ0FBQztBQUVuQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUM3QixPQUFPLEdBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUUzRCxJQUNDLE9BQU8sUUFBUSxLQUFLLFFBQVE7SUFDNUIsT0FBTyxRQUFRLENBQUMsYUFBYSxLQUFLLFVBQVUsRUFDM0M7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Q0FDcEQ7QUFNRCxNQUFNLFVBQVUsT0FBTyxDQUFDLEdBQVc7SUFDbEMsTUFBTSxPQUFPLEdBQUc7UUFDZixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDO0lBRUYsSUFBSTtRQUNILE1BQU0sQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0tBQ2I7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBRUQsTUFBTSxVQUFVLFVBQVUsQ0FDekIsR0FBVyxFQUNYLElBQW9CLEVBQ3BCLElB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QUUsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxFQUNELFlBQVksQ0FDWixDQUFDO0tBQ0Y7QUFDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtjYWxsYmFjaywgbG9nZ2VyfSBmcm9tICcuJztcblxuY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsXG5cdCAgaXNPbGRJRSAgPSAvTVNJRVxccyhbNS05XVxcLjApLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5pZiAoXG5cdHR5cGVvZiBkb2N1bWVudCAhPT0gJ29iamVjdCcgfHxcblx0dHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgIT09ICdmdW5jdGlvbidcbikge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ3NjcmlwdExvYWRlciBpcyBmb3Igd2ViIHVzZSBvbmx5Jyk7XG59XG5cbmV4cG9ydCB0eXBlIE9TY3JpcHRGaWxlID0gW3N0cmluZywgKCkgPT4gYm9vbGVhbl0gfCBbc3RyaW5nXTtcbmV4cG9ydCB0eXBlIE9CYXRjaENiID0gKHN1Y2Nlc3M6IGJvb2xlYW4sIGRvbmU6IHN0cmluZ1tdLCBmYWlsZWQ6IHN0cmluZ1tdKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgT1NjcmlwdExvYWRDYiA9IChzcmM6IHN0cmluZykgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vQ2FjaGUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCBfcmFuZG9tID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBTdHJpbmcoTWF0aC5yYW5kb20oKSkuc3Vic3RyaW5nKDIpO1xuXHR9O1xuXG5cdHRyeSB7XG5cdFx0Y29uc3QgdSA9IG5ldyBVUkwodXJsLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cdFx0dS5zZWFyY2hQYXJhbXMuc2V0KCdub19jYWNoZScsIF9yYW5kb20oKSk7XG5cdFx0dXJsID0gdS5ocmVmO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0bG9nZ2VyLmVycm9yKCd1bmFibGUgdG8gZGlzYWJsZSBjYWNoaW5nIG9uIGZpbGUnLCB1cmwsIGUpO1xuXHR9XG5cblx0cmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTY3JpcHQoXG5cdHNyYzogc3RyaW5nLFxuXHR0aGVuPzogT1NjcmlwdExvYWRDYixcblx0ZmFpbD86IE9TY3JpcHRMb2FkQ2IsXG5cdGRpc2FibGVDYWNoZSA9IGZhbHNlLFxuKSB7XG5cdGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2xvYWQtcGF0aD0nJHtzcmN9J11gKSkge1xuXHRcdGlmIChkaXNhYmxlQ2FjaGUpIHtcblx0XHRcdHNyYyA9IG5vQ2FjaGUoc3JjKTtcblx0XHR9XG5cblx0XHRjb25zdCBzY3JpcHQgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXHRcdHNjcmlwdC5zcmMgICAgID0gc3JjO1xuXHRcdHNjcmlwdC5hc3luYyAgID0gZmFsc2U7XG5cdFx0c2NyaXB0LnR5cGUgICAgPSAndGV4dC9qYXZhc2NyaXB0Jztcblx0XHRzY3JpcHQub25sb2FkICA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGNhbGxiYWNrKHRoZW4sIFtzcmNdKTtcblx0XHR9O1xuXHRcdHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0c2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRcdGNhbGxiYWNrKGZhaWwsIFtzcmNdKTtcblx0XHR9O1xuXG5cdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgnbG9hZC1wYXRoJywgc3JjKTtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0Ly8gaWU5IGhhY2s6IHRvIGZvcmNlIHNjcmlwdCBleGVjdXRpb24gaW4gb3JkZXJcblx0XHQvLyBzaW5jZSBpZTkgZG9lcyBub3Qgc3VwcG9ydCBzY3JpcHQuYXN5bmMgID0gZmFsc2U7XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2g1YnAvbGF6eXdlYi1yZXF1ZXN0cy9pc3N1ZXMvNDIjaXNzdWUtMTM4MjE0NlxuXHRcdGlmIChpc09sZElFKSB7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y2FsbGJhY2sodGhlbiwgW3NyY10pO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU2NyaXB0QmF0Y2goXG5cdGxpc3Q6IE9TY3JpcHRGaWxlW10sXG5cdHRoZW4/OiBPQmF0Y2hDYixcblx0ZGlzYWJsZUNhY2hlID0gZmFsc2UsXG4pOiB2b2lkIHtcblx0Y29uc3QgdG90YWwgICAgICAgICAgICA9IGxpc3QubGVuZ3RoO1xuXHRjb25zdCBmYWlsZWQ6IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IGRvbmU6IHN0cmluZ1tdICAgPSBbXTtcblx0bGV0IGNvdW50ZXIgICAgICAgICAgICA9IDA7XG5cdGNvbnN0IHVwZGF0ZUNvdW50ICAgICAgPSAoc3VjY2VzczogYm9vbGVhbiwgc3JjOiBzdHJpbmcpID0+IHtcblx0XHRjb3VudGVyKys7XG5cdFx0KHN1Y2Nlc3MgPyBkb25lIDogZmFpbGVkKS5wdXNoKHNyYyk7XG5cblx0XHRpZiAoY291bnRlciA9PT0gdG90YWwpIHtcblx0XHRcdGNhbGxiYWNrKHRoZW4sIFshZmFpbGVkLmxlbmd0aCwgZG9uZSwgZmFpbGVkXSk7XG5cdFx0fVxuXHR9O1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuXHRcdGNvbnN0IHNyYyA9IGxpc3RbaV1bMF07XG5cdFx0Y29uc3QgZm4gID0gbGlzdFtpXVsxXTtcblxuXHRcdGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicgJiYgIWZuKCkpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGxvYWRTY3JpcHQoXG5cdFx0XHRzcmMsXG5cdFx0XHQoX3NyYykgPT4ge1xuXHRcdFx0XHR1cGRhdGVDb3VudCh0cnVlLCBfc3JjKTtcblx0XHRcdH0sXG5cdFx0XHQoX3NyYykgPT4ge1xuXHRcdFx0XHR1cGRhdGVDb3VudChmYWxzZSwgX3NyYyk7XG5cdFx0XHR9LFxuXHRcdFx0ZGlzYWJsZUNhY2hlLFxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==