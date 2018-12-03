import oz from "./oz.mixin";
let fieldId = 0;
export default function (app) {
    return oz(app).extend({
        methods: {
            ow_local_time: function (time) {
                let offset = (new Date).getTimezoneOffset() * 60;
                if (typeof time === "string") {
                    time = parseInt(time);
                }
                return (time + offset) * 1000;
            },
            ow_route_link: function (path) {
                return app.router.pathToURL(path).href;
            },
            ow_mark_field(field) {
                let id = "ow-field-id-" + (++fieldId);
                if (field.label) {
                    field.label.for = id;
                }
                if (field.attributes) {
                    field.attributes.id = id;
                }
                return field;
            }
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWl4aW5zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUU1QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFFaEIsTUFBTSxDQUFDLE9BQU8sV0FBVyxHQUFZO0lBQ3BDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNyQixPQUFPLEVBQUU7WUFDUixhQUFhLEVBQUUsVUFBVSxJQUFxQjtnQkFDN0MsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUVqRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtvQkFDN0IsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEI7Z0JBRUQsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDL0IsQ0FBQztZQUNELGFBQWEsRUFBRSxVQUFVLElBQVk7Z0JBQ3BDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3hDLENBQUM7WUFDRCxhQUFhLENBQUMsS0FBVTtnQkFDdkIsSUFBSSxFQUFFLEdBQUcsY0FBYyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO29CQUNoQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7aUJBQ3JCO2dCQUNELElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRTtvQkFDckIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO2lCQUN6QjtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7U0FDRDtLQUNELENBQUMsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi4vT1dlYkFwcFwiO1xuaW1wb3J0IG96IGZyb20gXCIuL296Lm1peGluXCI7XG5cbmxldCBmaWVsZElkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGFwcDogT1dlYkFwcCkge1xuXHRyZXR1cm4gb3ooYXBwKS5leHRlbmQoe1xuXHRcdG1ldGhvZHM6IHtcblx0XHRcdG93X2xvY2FsX3RpbWU6IGZ1bmN0aW9uICh0aW1lOiBzdHJpbmcgfCBudW1iZXIpIHtcblx0XHRcdFx0bGV0IG9mZnNldCA9IChuZXcgRGF0ZSkuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgdGltZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdHRpbWUgPSBwYXJzZUludCh0aW1lKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAodGltZSArIG9mZnNldCkgKiAxMDAwO1xuXHRcdFx0fSxcblx0XHRcdG93X3JvdXRlX2xpbms6IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdFx0XHRyZXR1cm4gYXBwLnJvdXRlci5wYXRoVG9VUkwocGF0aCkuaHJlZjtcblx0XHRcdH0sXG5cdFx0XHRvd19tYXJrX2ZpZWxkKGZpZWxkOiBhbnkpIHtcblx0XHRcdFx0bGV0IGlkID0gXCJvdy1maWVsZC1pZC1cIiArICgrK2ZpZWxkSWQpO1xuXHRcdFx0XHRpZiAoZmllbGQubGFiZWwpIHtcblx0XHRcdFx0XHRmaWVsZC5sYWJlbC5mb3IgPSBpZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoZmllbGQuYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGZpZWxkLmF0dHJpYnV0ZXMuaWQgPSBpZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmaWVsZDtcblx0XHRcdH1cblx0XHR9XG5cdH0pXG59Il19