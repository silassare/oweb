let OWebFS = /** @class */ (() => {
    class OWebFS {
        /**
         * Checks for file object.
         *
         * @param f
         */
        static isFile(f) {
            return f instanceof Blob || f instanceof File;
        }
        /**
         * Checks for marked file object.
         * @param f
         */
        static isMarkedFile(f) {
            return OWebFS.isFile(f) && f.oz_mark_file_id && f.oz_mark_file_key;
        }
        /**
         * Creates O'Zone file alias.
         *
         * @param info
         */
        static createFileAlias(info) {
            const fileName = info.file_id + '.ofa', content = JSON.stringify({
                file_id: info.file_id,
                file_key: info.file_key,
            }), b = new Blob([content], { type: OWebFS.OFA_MIME_TYPE });
            return new File([b], fileName, { type: b.type });
        }
    }
    OWebFS.OFA_MIME_TYPE = 'text/x-ozone-file-alias';
    return OWebFS;
})();
export default OWebFS;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJGUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQTtJQUFBLE1BQXFCLE1BQU07UUFHMUI7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBTTtZQUNuQixPQUFPLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQztRQUMvQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFNO1lBQ3pCLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwRSxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBb0I7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQ3JDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87Z0JBQ3JCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTthQUN2QixDQUFDLEVBQ0YsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFFekQsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDOztJQWpDZSxvQkFBYSxHQUFHLHlCQUF5QixDQUFDO0lBa0MzRCxhQUFDO0tBQUE7ZUFuQ29CLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSB0RmlsZVF1YWxpdHkgPSAwIHwgMSB8IDIgfCAzO1xyXG5leHBvcnQgdHlwZSB0RmlsZUFsaWFzSW5mbyA9IHtcclxuXHRmaWxlX2lkOiBzdHJpbmc7XHJcblx0ZmlsZV9rZXk6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJGUyB7XHJcblx0c3RhdGljIHJlYWRvbmx5IE9GQV9NSU1FX1RZUEUgPSAndGV4dC94LW96b25lLWZpbGUtYWxpYXMnO1xyXG5cclxuXHQvKipcclxuXHQgKiBDaGVja3MgZm9yIGZpbGUgb2JqZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZcclxuXHQgKi9cclxuXHRzdGF0aWMgaXNGaWxlKGY6IGFueSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIGYgaW5zdGFuY2VvZiBCbG9iIHx8IGYgaW5zdGFuY2VvZiBGaWxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2tzIGZvciBtYXJrZWQgZmlsZSBvYmplY3QuXHJcblx0ICogQHBhcmFtIGZcclxuXHQgKi9cclxuXHRzdGF0aWMgaXNNYXJrZWRGaWxlKGY6IGFueSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIE9XZWJGUy5pc0ZpbGUoZikgJiYgZi5vel9tYXJrX2ZpbGVfaWQgJiYgZi5vel9tYXJrX2ZpbGVfa2V5O1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogQ3JlYXRlcyBPJ1pvbmUgZmlsZSBhbGlhcy5cclxuXHQgKlxyXG5cdCAqIEBwYXJhbSBpbmZvXHJcblx0ICovXHJcblx0c3RhdGljIGNyZWF0ZUZpbGVBbGlhcyhpbmZvOiB0RmlsZUFsaWFzSW5mbyk6IEZpbGUge1xyXG5cdFx0Y29uc3QgZmlsZU5hbWUgPSBpbmZvLmZpbGVfaWQgKyAnLm9mYScsXHJcblx0XHRcdGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRcdFx0ZmlsZV9pZDogaW5mby5maWxlX2lkLFxyXG5cdFx0XHRcdGZpbGVfa2V5OiBpbmZvLmZpbGVfa2V5LFxyXG5cdFx0XHR9KSxcclxuXHRcdFx0YiA9IG5ldyBCbG9iKFtjb250ZW50XSwgeyB0eXBlOiBPV2ViRlMuT0ZBX01JTUVfVFlQRSB9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEZpbGUoW2JdLCBmaWxlTmFtZSwgeyB0eXBlOiBiLnR5cGUgfSk7XHJcblx0fVxyXG59XHJcbiJdfQ==