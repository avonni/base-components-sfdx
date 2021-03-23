export function assert(condition, message) {
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV !== 'production') {
        if (!condition) {
            throw new Error(message);
        }
    }
}
