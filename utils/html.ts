import {JSDOM} from "jsdom";

export function generateHTMLTextPreview(html: string, maxLength?: number): string {
    if (!html) {
        return '';
    }

    const dom = new JSDOM(html);
    const document = dom.window.document;

    document.querySelectorAll('style, script, noscript, meta, link').forEach(el => el.remove());

    let textContent = document.body.textContent || '';

    textContent = textContent.replace(/\s+/g, ' ').trim();

    if (maxLength !== undefined && textContent.length > maxLength) {
        textContent = textContent.substring(0, maxLength) + '...';
    }

    return textContent;
}