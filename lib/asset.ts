export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

export const thumb = (src: string) => src.replace("/media/items/", "/media/items/sm/");
