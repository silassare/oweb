import { callback, _error } from './Utils';
const document = window.document, isOldIE = /MSIE\s([5-9]\.0)/.test(navigator.userAgent);
if (typeof document !== 'object' ||
    typeof document.createElement !== 'function') {
    throw new Error('scriptLoader is for web use only');
}
const batchLoad = function (list, then, disableCache = false) {
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
        tryLoad(src, (_src) => {
            updateCount(true, _src);
        }, (_src) => {
            updateCount(false, _src);
        }, disableCache);
    }
};
const noCache = function (url) {
    const _random = function () {
        return String(Math.random()).substring(2);
    };
    try {
        const u = new URL(url, window.location.href);
        u.searchParams.set('no_cache', _random());
        url = u.href;
    }
    catch (e) {
        _error('unable to disable caching on file', url, e);
    }
    return url;
};
const tryLoad = function (src, then, fail, disableCache = false) {
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
            script.parentNode.removeChild(script);
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
};
export default {
    noCache,
    tryLoad,
    batchLoad,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0TG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL3NjcmlwdExvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUUzQyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUMvQixPQUFPLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUV4RCxJQUNDLE9BQU8sUUFBUSxLQUFLLFFBQVE7SUFDNUIsT0FBTyxRQUFRLENBQUMsYUFBYSxLQUFLLFVBQVUsRUFDM0M7SUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Q0FDcEQ7QUFNRCxNQUFNLFNBQVMsR0FBRyxVQUNqQixJQUFtQixFQUNuQixJQUFlLEVBQ2YsZUFBd0IsS0FBSztJQUU3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzFCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLElBQUksR0FBYSxFQUFFLENBQUM7SUFDMUIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBZ0IsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUNyRCxPQUFPLEVBQUUsQ0FBQztRQUNWLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQyxJQUFJLE9BQU8sS0FBSyxLQUFLLEVBQUU7WUFDdEIsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUMvQztJQUNGLENBQUMsQ0FBQztJQUVGLEtBQUssSUFB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QUcsQ0FBQyxDQUFDLENBQUM7S0FDdEI7QUFDRixDQUFDLENBQUM7QUFFRixlQUFlO0lBQ2QsT0FBTztJQUNQLE9BQU87SUFDUCxTQUFTO0NBQ1QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNhbGxiYWNrLCBfZXJyb3IgfSBmcm9tICcuL1V0aWxzJztcblxuY29uc3QgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsXG5cdGlzT2xkSUUgPSAvTVNJRVxccyhbNS05XVxcLjApLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5pZiAoXG5cdHR5cGVvZiBkb2N1bWVudCAhPT0gJ29iamVjdCcgfHxcblx0dHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgIT09ICdmdW5jdGlvbidcbikge1xuXHR0aHJvdyBuZXcgRXJyb3IoJ3NjcmlwdExvYWRlciBpcyBmb3Igd2ViIHVzZSBvbmx5Jyk7XG59XG5cbmV4cG9ydCB0eXBlIHRTY3JpcHRGaWxlID0gW2FueSwgKCkgPT4gYm9vbGVhbl0gfCBbYW55XTtcbnR5cGUgdEJhdGNoQ2IgPSAoc3VjY2VzczogYm9vbGVhbiwgZG9uZTogc3RyaW5nW10sIGZhaWxlZDogc3RyaW5nW10pID0+IHZvaWQ7XG50eXBlIHRUcnlMb2FkQ2IgPSAoc3JjOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmNvbnN0IGJhdGNoTG9hZCA9IGZ1bmN0aW9uIChcblx0bGlzdDogdFNjcmlwdEZpbGVbXSxcblx0dGhlbj86IHRCYXRjaENiLFxuXHRkaXNhYmxlQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSxcbik6IHZvaWQge1xuXHRjb25zdCB0b3RhbCA9IGxpc3QubGVuZ3RoO1xuXHRjb25zdCBmYWlsZWQ6IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IGRvbmU6IHN0cmluZ1tdID0gW107XG5cdGxldCBjb3VudGVyID0gMDtcblx0Y29uc3QgdXBkYXRlQ291bnQgPSAoc3VjY2VzczogYm9vbGVhbiwgc3JjOiBzdHJpbmcpID0+IHtcblx0XHRjb3VudGVyKys7XG5cdFx0KHN1Y2Nlc3MgPyBkb25lIDogZmFpbGVkKS5wdXNoKHNyYyk7XG5cblx0XHRpZiAoY291bnRlciA9PT0gdG90YWwpIHtcblx0XHRcdGNhbGxiYWNrKHRoZW4sIFshZmFpbGVkLmxlbmd0aCwgZG9uZSwgZmFpbGVkXSk7XG5cdFx0fVxuXHR9O1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuXHRcdGNvbnN0IHNyYyA9IGxpc3RbaV1bMF07XG5cdFx0Y29uc3QgZm4gPSBsaXN0W2ldWzFdO1xuXG5cdFx0aWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJyAmJiAhZm4oKSkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0dHJ5TG9hZChcblx0XHRcdHNyYyxcblx0XHRcdChfc3JjKSA9PiB7XG5cdFx0XHRcdHVwZGF0ZUNvdW50KHRydWUsIF9zcmMpO1xuXHRcdFx0fSxcblx0XHRcdChfc3JjKSA9PiB7XG5cdFx0XHRcdHVwZGF0ZUNvdW50KGZhbHNlLCBfc3JjKTtcblx0XHRcdH0sXG5cdFx0XHRkaXNhYmxlQ2FjaGUsXG5cdFx0KTtcblx0fVxufTtcblxuY29uc3Qgbm9DYWNoZSA9IGZ1bmN0aW9uICh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IF9yYW5kb20gPSBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIFN0cmluZyhNYXRoLnJhbmRvbSgpKS5zdWJzdHJpbmcoMik7XG5cdH07XG5cblx0dHJ5IHtcblx0XHRjb25zdCB1ID0gbmV3IFVSTCh1cmwsIHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblx0XHR1LnNlYXJjaFBhcmFtcy5zZXQoJ25vX2NhY2hlJywgX3JhbmRvbSgpKTtcblx0XHR1cmwgPSB1LmhyZWY7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRfZXJyb3IoJ3VuYWJsZSB0byBkaXNhYmxlIGNhY2hpbmcgb24gZmlsZScsIHVybCwgZSk7XG5cdH1cblxuXHRyZXR1cm4gdXJsO1xufTtcblxuY29uc3QgdHJ5TG9hZCA9IGZ1bmN0aW9uIChcblx0c3JjOiBzdHJpbmcsXG5cdHRoZW4/OiB0VHJ5TG9hZENiLFxuXHRmYWlsPzogdFRyeUxvYWRDYixcblx0ZGlzYWJsZUNhY2hlOiBib29sZWFuID0gZmFsc2UsXG4pIHtcblx0aWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbbG9hZC1wYXRoPScke3NyY30nXWApKSB7XG5cdFx0aWYgKGRpc2FibGVDYWNoZSkge1xuXHRcdFx0c3JjID0gbm9DYWNoZShzcmMpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXHRcdHNjcmlwdC5zcmMgPSBzcmM7XG5cdFx0c2NyaXB0LmFzeW5jID0gZmFsc2U7XG5cdFx0c2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0Jztcblx0XHRzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Y2FsbGJhY2sodGhlbiwgW3NyY10pO1xuXHRcdH07XG5cdFx0c2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRzY3JpcHQucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRcdGNhbGxiYWNrKGZhaWwsIFtzcmNdKTtcblx0XHR9O1xuXG5cdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgnbG9hZC1wYXRoJywgc3JjKTtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0Ly8gaWU5IGhhY2s6IHRvIGZvcmNlIHNjcmlwdCBleGVjdXRpb24gaW4gb3JkZXJcblx0XHQvLyBzaW5jZSBpZTkgZG9lcyBub3Qgc3VwcG9ydCBzY3JpcHQuYXN5bmMgID0gZmFsc2U7XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2g1YnAvbGF6eXdlYi1yZXF1ZXN0cy9pc3N1ZXMvNDIjaXNzdWUtMTM4MjE0NlxuXHRcdGlmIChpc09sZElFKSB7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Y2FsbGJhY2sodGhlbiwgW3NyY10pO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdG5vQ2FjaGUsXG5cdHRyeUxvYWQsXG5cdGJhdGNoTG9hZCxcbn07XG4iXX0=