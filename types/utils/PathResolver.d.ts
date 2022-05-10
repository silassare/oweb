declare const PathResolver: {
    /**
     * The directory separator.
     */
    DS: string;
    /**
     * Resolve a given path to the the given root.
     *
     * @param root
     * @param path
     */
    resolve(root: string, path: string): string;
    /**
     * Do the path resolving job.
     *
     * @param path
     */
    job(path: string): string;
    /**
     * Normalize a given path.
     *
     * @param path
     */
    normalize(path: string): string;
    /**
     * Checks if a path is a relative path.
     * @param path
     */
    isRelative(path: string): boolean;
};
export default PathResolver;
//# sourceMappingURL=PathResolver.d.ts.map