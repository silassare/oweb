import OWebApp from "../OWebApp";
export default function (app: OWebApp): {
    ow_local_time: (time: string | number) => number;
    ow_route_link: (path: string) => string;
    ow_mark_field(field: any): any;
    oz_file_link: (file: string, quality?: import("../OWebFS").tFileQuality, def?: string | undefined) => string;
};
