// Public assets need the deploy base path prefixed by hand: unoptimized
// next/image and plain <video> emit their src as-is.
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
