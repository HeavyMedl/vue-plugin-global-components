/**
 * import.meta.glob('path/to/components');
 *
 * @export
 * @interface GlobDynamicImport
 */
export default interface GlobDynamicImport {
  [key: string]: () => Promise<unknown>;
}
