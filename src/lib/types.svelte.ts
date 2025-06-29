export interface Image {
    name: string;
    url: string;
    // Path to the image file (for local files). Can be converted to a URL using convertFileSrc.
    path?: string;
}

const collator = new Intl.Collator();

export function compareImages(a: Image, b: Image): number {
    return collator.compare(a.name, b.name);
}
