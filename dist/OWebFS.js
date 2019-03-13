export default class OWebFS {
    /**
     * Check for file object.
     *
     * @param f
     */
    static isFile(f) {
        return (f instanceof Blob || f instanceof File);
    }
    /**
     * Check for marked file object.
     * @param f
     */
    static isMarkedFile(f) {
        return OWebFS.isFile(f) && f["oz_mark_file_id"] && f["oz_mark_file_key"];
    }
    /**
     * Create O'Zone file alias.
     *
     * @param info
     */
    static createFileAlias(info) {
        let file_name = info.file_id + ".ofa", content = JSON.stringify({
            "file_id": info.file_id,
            "file_key": info.file_key
        }), b = new Blob([content], { type: OWebFS.OFA_MIME_TYPE });
        return new File([b], file_name, { type: b.type });
    }
}
OWebFS.OFA_MIME_TYPE = "text/x-ozone-file-alias";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkZTLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJGUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLENBQUMsT0FBTztJQUdiOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQU07UUFDbkIsT0FBTyxDQUFDLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLENBQU07UUFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFvQjtRQUMxQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFDcEMsT0FBTyxHQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDMUIsU0FBUyxFQUFHLElBQUksQ0FBQyxPQUFPO1lBQ3hCLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN6QixDQUFDLEVBQ0YsQ0FBQyxHQUFXLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFFL0QsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNqRCxDQUFDOztBQWpDZSxvQkFBYSxHQUFHLHlCQUF5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgdEZpbGVRdWFsaXR5ID0gMCB8IDEgfCAyIHwgMztcclxuZXhwb3J0IHR5cGUgdEZpbGVBbGlhc0luZm8gPSB7XHJcblx0ZmlsZV9pZDogc3RyaW5nLFxyXG5cdGZpbGVfa2V5OiBzdHJpbmdcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkZTIHtcclxuXHRzdGF0aWMgcmVhZG9ubHkgT0ZBX01JTUVfVFlQRSA9IFwidGV4dC94LW96b25lLWZpbGUtYWxpYXNcIjtcclxuXHJcblx0LyoqXHJcblx0ICogQ2hlY2sgZm9yIGZpbGUgb2JqZWN0LlxyXG5cdCAqXHJcblx0ICogQHBhcmFtIGZcclxuXHQgKi9cclxuXHRzdGF0aWMgaXNGaWxlKGY6IGFueSk6IGJvb2xlYW4ge1xyXG5cdFx0cmV0dXJuIChmIGluc3RhbmNlb2YgQmxvYiB8fCBmIGluc3RhbmNlb2YgRmlsZSk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDaGVjayBmb3IgbWFya2VkIGZpbGUgb2JqZWN0LlxyXG5cdCAqIEBwYXJhbSBmXHJcblx0ICovXHJcblx0c3RhdGljIGlzTWFya2VkRmlsZShmOiBhbnkpOiBib29sZWFuIHtcclxuXHRcdHJldHVybiBPV2ViRlMuaXNGaWxlKGYpICYmIGZbXCJvel9tYXJrX2ZpbGVfaWRcIl0gJiYgZltcIm96X21hcmtfZmlsZV9rZXlcIl07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBDcmVhdGUgTydab25lIGZpbGUgYWxpYXMuXHJcblx0ICpcclxuXHQgKiBAcGFyYW0gaW5mb1xyXG5cdCAqL1xyXG5cdHN0YXRpYyBjcmVhdGVGaWxlQWxpYXMoaW5mbzogdEZpbGVBbGlhc0luZm8pOiBGaWxlIHtcclxuXHRcdGxldCBmaWxlX25hbWUgPSBpbmZvLmZpbGVfaWQgKyBcIi5vZmFcIixcclxuXHRcdFx0Y29udGVudCAgID0gSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFwiZmlsZV9pZFwiIDogaW5mby5maWxlX2lkLFxyXG5cdFx0XHRcdFwiZmlsZV9rZXlcIjogaW5mby5maWxlX2tleVxyXG5cdFx0XHR9KSxcclxuXHRcdFx0YiAgICAgICAgID0gbmV3IEJsb2IoW2NvbnRlbnRdLCB7dHlwZTogT1dlYkZTLk9GQV9NSU1FX1RZUEV9KTtcclxuXHJcblx0XHRyZXR1cm4gbmV3IEZpbGUoW2JdLCBmaWxlX25hbWUsIHt0eXBlOiBiLnR5cGV9KTtcclxuXHR9XHJcbn0iXX0=