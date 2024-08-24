export function encodeDecodeHTML(str: string, encode = true) {
    const encodeMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
    };

    const decodeMap: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/',
    };

    if (encode) {
        return str.replace(/[&<>"'/]/g, function(m) { return encodeMap[m]; });
    } else {
        return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;)/g, function(m) { return decodeMap[m]; });
    }
}

export function generateContentId() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1e16);
    return `image-${timestamp}-${randomNum}`;
}
