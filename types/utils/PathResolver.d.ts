declare const PathResolver: {
    DS: string;
    resolve(root: string, path: string): string;
    job(path: string): string;
    normalize(path: string): string;
    isRelative(path: string): boolean;
};
export default PathResolver;
