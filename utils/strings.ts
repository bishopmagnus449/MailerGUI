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

export function camelToNormal(str: string) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./,  s => s.toUpperCase());
}

export function dashToNormal(str: string) {
    return str.replace(/-/g, ' ').replace(/^./,  s => s.toUpperCase());
}

export function customEncoder(str: string) {
    function n(input: string) {
        return input.split("").map(character => String.fromCharCode(character.charCodeAt(0) + 1)).join("");
    }
    function t(input: string) {
        return input.split("").reverse().join("");
    }
    function o(input: string) {
        try {
            return new URL(input),
                !0
        } catch {
            return !1
        }
    }

    const encoded = encodeURIComponent(str);
    const reversed = t(encoded);
    const charShifted = n(reversed);
    return btoa(charShifted);
}