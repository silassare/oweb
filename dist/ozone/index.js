import OZone from './OZone';
import { isEmpty, isPlainObject } from '../utils';
export function cleanRequestOptions(options) {
    const _options = {};
    if (typeof options.max === 'number') {
        _options.max = options.max;
    }
    if (typeof options.page === 'number') {
        _options.page = options.page;
    }
    if (typeof options.relations === 'string' && !isEmpty(options.relations)) {
        _options.relations = options.relations;
    }
    if (typeof options.collection === 'string' && !isEmpty(options.collection)) {
        _options.collection = options.collection;
    }
    if (typeof options.order_by === 'string' && !isEmpty(options.order_by)) {
        _options['order_by'] = options.order_by;
    }
    if (isPlainObject(options.filters) && !isEmpty(options.filters)) {
        _options.filters = options.filters;
    }
    return _options;
}
export default OZone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3pvbmUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBQzVCLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBa0dsRCxNQUFNLFVBQVUsbUJBQW1CLENBQ2xDLE9BQWtDO0lBRWxDLE1BQU0sUUFBUSxHQUE4QixFQUFFLENBQUM7SUFDL0MsSUFBSSxPQUFPLE9BQU8sQ0FBQyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQ3BDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztLQUMzQjtJQUNELElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUNyQyxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7S0FDN0I7SUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLFNBQVMsS0FBSyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3pFLFFBQVEsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztLQUN2QztJQUNELElBQUksT0FBTyxPQUFPLENBQUMsVUFBVSxLQUFLLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDM0UsUUFBUSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0tBQ3pDO0lBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUN2RSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztLQUN4QztJQUVELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDaEUsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO0tBQ25DO0lBRUQsT0FBTyxRQUFRLENBQUM7QUFDakIsQ0FBQztBQUVELGVBQWUsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9ab25lIGZyb20gJy4vT1pvbmUnO1xuaW1wb3J0IHsgaXNFbXB0eSwgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4uL3V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBPQXBpUmVzcG9uc2U8Uj4ge1xuXHRlcnJvcjogbnVtYmVyO1xuXHRtc2c6IHN0cmluZztcblx0ZGF0YTogUjtcblx0dXRpbWU6IG51bWJlcjsgLy8gcmVzcG9uc2UgdGltZVxuXHRzdGltZT86IG51bWJlcjsgLy8gc2Vzc2lvbiBleHBpcmUgdGltZVxuXHRzdG9rZW4/OiBzdHJpbmc7IC8vIHNlc3Npb24gdG9rZW5cbn1cblxuZXhwb3J0IHR5cGUgT0FwaUFkZFJlc3BvbnNlPFQ+ID0gT0FwaVJlc3BvbnNlPHtcblx0aXRlbTogVDtcbn0+O1xuXG5leHBvcnQgdHlwZSBPQXBpR2V0UmVzcG9uc2U8VD4gPSBPQXBpUmVzcG9uc2U8e1xuXHRpdGVtOiBUO1xuXHRyZWxhdGlvbnM/OiB7XG5cdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHR9O1xufT47XG5cbmV4cG9ydCB0eXBlIE9BcGlHZXRBbGxSZXNwb25zZTxUPiA9IE9BcGlSZXNwb25zZTx7XG5cdGl0ZW1zOiBUW107XG5cdG1heD86IG51bWJlcjtcblx0cGFnZT86IG51bWJlcjtcblx0dG90YWw/OiBudW1iZXI7XG5cdHJlbGF0aW9ucz86IHtcblx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdH07XG59PjtcblxuZXhwb3J0IHR5cGUgT0FwaVVwZGF0ZVJlc3BvbnNlPFQ+ID0gT0FwaVJlc3BvbnNlPHtcblx0aXRlbTogVDtcbn0+O1xuXG5leHBvcnQgdHlwZSBPQXBpVXBkYXRlQWxsUmVzcG9uc2UgPSBPQXBpUmVzcG9uc2U8e1xuXHRhZmZlY3RlZDogbnVtYmVyO1xufT47XG5cbmV4cG9ydCB0eXBlIE9BcGlEZWxldGVSZXNwb25zZTxUPiA9IE9BcGlSZXNwb25zZTx7XG5cdGl0ZW06IFQ7XG59PjtcblxuZXhwb3J0IHR5cGUgT0FwaURlbGV0ZUFsbFJlc3BvbnNlID0gT0FwaVJlc3BvbnNlPHtcblx0YWZmZWN0ZWQ6IG51bWJlcjtcbn0+O1xuXG5leHBvcnQgdHlwZSBPQXBpR2V0UGFnaW5hdGVkUmVsYXRpb25JdGVtc1Jlc3BvbnNlPFI+ID0gT0FwaVJlc3BvbnNlPHtcblx0aXRlbXM6IFJbXTtcblx0bWF4PzogbnVtYmVyO1xuXHRwYWdlPzogbnVtYmVyO1xuXHR0b3RhbD86IG51bWJlcjtcbn0+O1xuXG5leHBvcnQgdHlwZSBPQXBpR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8Uj4gPSBPQXBpUmVzcG9uc2U8e1xuXHRpdGVtOiBSO1xufT47XG5cbmV4cG9ydCB0eXBlIE9BcGlGaWx0ZXJDb25kaXRpb24gPVxuXHR8ICdlcSdcblx0fCAnbmVxJ1xuXHR8ICdsdCdcblx0fCAnbHRlJ1xuXHR8ICdndCdcblx0fCAnZ3RlJ1xuXHR8ICdpbidcblx0fCAnbm90X2luJ1xuXHR8ICdpc19udWxsJ1xuXHR8ICdpc19ub3RfbnVsbCdcblx0fCAnbGlrZSdcblx0fCAnbm90X2xpa2UnO1xuXG5leHBvcnQgdHlwZSBPQXBpRmlsdGVyID1cblx0fCB7XG5cdFx0XHQwOiBFeGNsdWRlPE9BcGlGaWx0ZXJDb25kaXRpb24sICdpc19udWxsJyB8ICdpc19ub3RfbnVsbCc+O1xuXHRcdFx0MTogc3RyaW5nIHwgbnVtYmVyIHwgKHN0cmluZyB8IG51bWJlcilbXTtcblx0XHRcdDI/OiAnb3InIHwgJ2FuZCc7XG5cdCAgfVxuXHR8IHtcblx0XHRcdDA6ICdpc19udWxsJyB8ICdpc19ub3RfbnVsbCc7XG5cdFx0XHQxPzogJ29yJyB8ICdhbmQnO1xuXHQgIH07XG5cbmV4cG9ydCB0eXBlIE9BcGlGaWx0ZXJzID0geyBba2V5OiBzdHJpbmddOiBudW1iZXIgfCBzdHJpbmcgfCBPQXBpRmlsdGVyW10gfTtcblxuZXhwb3J0IGludGVyZmFjZSBPQXBpU2VydmljZVJlcXVlc3RPcHRpb25zIHtcblx0ZGF0YT86IGFueTtcblx0ZmlsdGVycz86IE9BcGlGaWx0ZXJzO1xuXHRyZWxhdGlvbnM/OiBzdHJpbmcgfCBzdHJpbmdbXTtcblx0Y29sbGVjdGlvbj86IHN0cmluZztcblx0b3JkZXJfYnk/OiBzdHJpbmc7XG5cdG1heD86IG51bWJlcjtcblx0cGFnZT86IG51bWJlcjtcblxuXHRba2V5OiBzdHJpbmddOiB1bmtub3duO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5SZXF1ZXN0T3B0aW9ucyhcblx0b3B0aW9uczogT0FwaVNlcnZpY2VSZXF1ZXN0T3B0aW9uc1xuKTogT0FwaVNlcnZpY2VSZXF1ZXN0T3B0aW9ucyB7XG5cdGNvbnN0IF9vcHRpb25zOiBPQXBpU2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdH1cblx0aWYgKHR5cGVvZiBvcHRpb25zLnBhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5yZWxhdGlvbnMgPT09ICdzdHJpbmcnICYmICFpc0VtcHR5KG9wdGlvbnMucmVsYXRpb25zKSkge1xuXHRcdF9vcHRpb25zLnJlbGF0aW9ucyA9IG9wdGlvbnMucmVsYXRpb25zO1xuXHR9XG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uID09PSAnc3RyaW5nJyAmJiAhaXNFbXB0eShvcHRpb25zLmNvbGxlY3Rpb24pKSB7XG5cdFx0X29wdGlvbnMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0fVxuXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5vcmRlcl9ieSA9PT0gJ3N0cmluZycgJiYgIWlzRW1wdHkob3B0aW9ucy5vcmRlcl9ieSkpIHtcblx0XHRfb3B0aW9uc1snb3JkZXJfYnknXSA9IG9wdGlvbnMub3JkZXJfYnk7XG5cdH1cblxuXHRpZiAoaXNQbGFpbk9iamVjdChvcHRpb25zLmZpbHRlcnMpICYmICFpc0VtcHR5KG9wdGlvbnMuZmlsdGVycykpIHtcblx0XHRfb3B0aW9ucy5maWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzO1xuXHR9XG5cblx0cmV0dXJuIF9vcHRpb25zO1xufVxuXG5leHBvcnQgZGVmYXVsdCBPWm9uZTtcbiJdfQ==