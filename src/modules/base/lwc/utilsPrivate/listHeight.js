export function getListHeight(HTMLElements, maxItems) {
    let height = 0;
    if (!maxItems) maxItems = HTMLElements.length;

    for (let i = 0; i < maxItems && i < HTMLElements.length; i++) {
        height += HTMLElements[i].offsetHeight;
    }
    return height;
}
