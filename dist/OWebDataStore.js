"use strict";
let ls = window.localStorage;
let parse = function (data) {
    let value = undefined;
    if (data !== null) {
        try {
            value = JSON.parse(data);
        }
        catch (e) {
            console.error(e);
        }
    }
    return value;
};
export default class OWebDataStore {
    static save(keyName, data) {
        if (ls) {
            try {
                ls.setItem(keyName, JSON.stringify(data));
                return true;
            }
            catch (e) {
                console.error(e);
            }
        }
        return false;
    }
    static load(keyName) {
        if (ls) {
            if (arguments[0] instanceof RegExp) {
                let keyReg = arguments[0];
                let list = Object.keys(ls);
                let result = {};
                for (let i = 0; i < list.length; i++) {
                    let k = list[i];
                    if (keyReg.test(k)) {
                        result[k] = parse(ls.getItem(k));
                    }
                }
                return result;
            }
            else {
                return parse(ls.getItem(keyName));
            }
        }
        return null;
    }
    static remove(keyName) {
        if (ls) {
            if (arguments[0] instanceof RegExp) {
                let list = Object.keys(ls);
                let keyReg = arguments[0];
                let count = 0;
                for (let i = 0; i < list.length; i++) {
                    let k = list[i];
                    if (keyReg.test(k)) {
                        ls.removeItem(k);
                        count++;
                    }
                }
            }
            else {
                ls.removeItem(keyName);
            }
            return true;
        }
        return false;
    }
    static clear() {
        return ls && !ls.clear() && true;
    }
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkRhdGFTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViRGF0YVN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFFN0IsSUFBSSxLQUFLLEdBQUcsVUFBVSxJQUFtQjtJQUN4QyxJQUFJLEtBQUssR0FBUSxTQUFTLENBQUM7SUFFM0IsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2xCLElBQUk7WUFDSCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTztJQUViLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBZSxFQUFFLElBQVM7UUFDckMsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJO2dCQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDRDtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBZTtRQUMxQixJQUFJLEVBQUUsRUFBRTtZQUNQLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLE1BQU0sRUFBRTtnQkFDbkMsSUFBSSxNQUFNLEdBQVEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLElBQUksR0FBVSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLE1BQU0sR0FBUSxFQUFFLENBQUM7Z0JBRXJCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDbkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pDO2lCQUNEO2dCQUVELE9BQU8sTUFBTSxDQUFDO2FBRWQ7aUJBQU07Z0JBQ04sT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQWU7UUFDNUIsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxNQUFNLEVBQUU7Z0JBQ25DLElBQUksSUFBSSxHQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzdCLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxLQUFLLEdBQUksQ0FBQyxDQUFDO2dCQUVmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDbkIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakIsS0FBSyxFQUFFLENBQUM7cUJBQ1I7aUJBQ0Q7YUFDRDtpQkFBTTtnQkFDTixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLO1FBQ1gsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQUFBLENBQUMifQ==