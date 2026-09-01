export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/** The 512px cut. Everything but the reveal hero draws items under 260px, and
 *  `images.unoptimized` means the browser otherwise decodes the full 1000px file. */
export const thumb = (src: string) => src.replace("/media/items/", "/media/items/sm/");
