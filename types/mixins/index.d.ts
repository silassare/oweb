import OWebApp from "../OWebApp";
import { tFileQuality } from "../OWebFS";
export default function (app: OWebApp): {
    ow_file_url: (file: string, quality?: tFileQuality, def?: string | undefined) => string;
    ow_local_time: (time: string | number) => number;
    ow_route_link: (path: string) => string;
    ow_mark_field(field: any): any;
};
