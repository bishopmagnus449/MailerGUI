import {Faker, fakerDE, fakerEN, fakerEN_CA, fakerFR, fakerJA} from "@faker-js/faker";
import random from "random";
import {format} from "date-fns";
import base64 from "base-64";
import * as randomData from "../src/data/randomData";
import sharp from "sharp"
import {Buffer} from 'buffer';
import QRCode from 'qrcode';
import {createCanvas, registerFont} from 'canvas';
import {MailerConfig, Message, SMTPConfig} from "~/src/types/types";
import {customEncoder, generateContentId} from "~/utils/strings";
import {generateHTMLTextPreview} from "~/utils/html";
import * as Mail from "nodemailer/lib/mailer";
import { promisify } from 'util';
import sizeOf from 'image-size';

export class DataGenerator {
    fakerUS: Faker = fakerEN;
    fakerFR: Faker = fakerFR;
    fakerDE: Faker = fakerDE;
    fakerJA: Faker = fakerJA;
    fakerCA: Faker = fakerEN_CA;

    date: string;
    oldDate: string;
    email: string;
    company: string;
    emailBase64: string;
    emailId: string;
    receiverId: string;
    logoURL: string;
    word: string;
    usName: string;
    frName: string;
    deName: string;
    jaName: string;
    caName: string;
    usAddress: string;
    frAddress: string;
    deAddress: string;
    jaAddress: string;
    caAddress: string;
    usPhone: string;
    frPhone: string;
    dePhone: string;
    jaPhone: string;
    caPhone: string;
    fakeText: string;
    fakeEmail: string;
    lipsum: string;
    giftcode: string;
    letterUp: string;
    letterMix: string;
    letterLow: string;
    letterNumber: string;
    letterNumberUp: string;
    letterNumberMix: string;
    number: string;
    dolar: string;
    dolarCa: string;
    euro: string;
    jpy: string;
    cashTag: string;
    ip: string;
    amzIp: string;
    ovhIp: string;
    ionosIp: string;
    chimpIp: string;
    os: string;
    country: string;
    browser: string;
    userAgentMac: string;
    userAgentsWindows: string;
    tld: string;
    localDomain: string;
    domainLocal: string;
    domainSmtp: string;
    domainReceiver: string;
    short: string;
    pdfPassword: string;

    constructor(message: any, receiver: any, smtpConfig: SMTPConfig) {
        const now = new Date();
        const randomDate = new Date(now.getTime() - random.int(1, 3) * 86400000 - random.int(1, 24) * 3600000 - random.int(1, 60) * 60000);

        this.date = format(now, 'MM/dd/yyyy hh:mm:ss a');
        this.oldDate = format(randomDate, 'MM/dd/yyyy hh:mm:ss a');
        this.email = receiver || message['To'];
        this.company = this.email.split('@')[1].split('.')[0].charAt(0).toUpperCase() + this.email.split('@')[1].split('.')[0].slice(1);
        this.emailBase64 = base64.encode(this.email);
        this.emailId = this.email.split('@')[0].replace(/[._]/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        this.receiverId = this.email.split('@')[0];
        this.logoURL = 'https://logo.clearbit.com/' + this.email.split('@')[1]
        this.word = random.choice(randomData.words) || '';
        this.usName = this.fakerUS.person.fullName();
        this.frName = this.fakerFR.person.fullName();
        this.deName = this.fakerDE.person.fullName();
        this.jaName = this.fakerJA.person.fullName();
        this.caName = this.fakerCA.person.fullName();
        this.usAddress = this.fakerUS.location.streetAddress();
        this.frAddress = this.fakerFR.location.streetAddress();
        this.deAddress = this.fakerDE.location.streetAddress();
        this.jaAddress = this.fakerJA.location.streetAddress();
        this.caAddress = this.fakerCA.location.streetAddress();
        this.usPhone = this.fakerUS.phone.number();
        this.frPhone = this.fakerFR.phone.number();
        this.dePhone = this.fakerDE.phone.number();
        this.jaPhone = this.fakerJA.phone.number();
        this.caPhone = this.fakerCA.phone.number();
        this.fakeText = this.fakerUS.lorem.text();
        this.fakeEmail = this.fakerUS.internet.email().toLowerCase();
        this.lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' + this.fakerUS.lorem.paragraphs(5);
        this.giftcode = generateRandomString('#LETNUM-UP-16#');
        this.letterUp = generateRandomString(`#LET-UP-${random.int(4, 8)}#`);
        this.letterMix = generateRandomString(`#LET-MIX-${random.int(4, 8)}#`);
        this.letterLow = generateRandomString(`#LET-LOW-${random.int(4, 8)}#`);
        this.letterNumber = generateRandomString(`#LETNUM-LOW-${random.int(14, 16)}#`);
        this.letterNumberUp = generateRandomString(`#LETNUM-UP-${random.int(10, 12)}#`);
        this.letterNumberMix = generateRandomString(`#LETNUM-MIX-${random.int(10, 12)}#`);
        this.number = generateRandomString(`#NUM-${random.int(7, 9)}#`);
        this.dolar = `$${random.int(100, 250)}.${random.int(10, 99)}`;
        this.dolarCa = `C$${random.int(100, 250)}.${random.int(10, 99)}`;
        this.euro = `€${random.int(100, 250)}.${random.int(10, 99)} EUR`;
        this.jpy = `¥${random.int(3000, 5000)}`;
        this.cashTag = `$${this.fakerUS.person.firstName().replace(/\s/g, '')}`;
        this.ip = randomData.randomIP;
        this.amzIp = random.choice(randomData.amazonIps) || this.ip;
        this.ovhIp = random.choice(randomData.ovhIps) || this.ip;
        this.ionosIp = random.choice(randomData.ionosIps) || this.ip;
        this.chimpIp = random.choice(randomData.chimpIps) || this.ip;
        this.os = random.choice(randomData.operatingSystems) || '';
        this.country = random.choice(randomData.countries) || '';
        this.browser = random.choice(randomData.browsers) || '';
        this.userAgentMac = random.choice(randomData.userAgentsMac) || '';
        this.userAgentsWindows = random.choice(randomData.userAgentsWindows) || '';
        this.tld = random.choice(randomData.tlds) || '';
        this.localDomain = `${this.fakerUS.lorem.word()}.${this.fakerUS.lorem.word()}.${this.tld}`;
        this.domainLocal = `${this.fakerUS.lorem.word()}.${this.fakerUS.lorem.word()}.${this.tld}`;
        this.domainSmtp = smtpConfig['host'];
        this.domainReceiver = this.email.split('@')[1];
        this.short = '';
        this.pdfPassword = '';
    }
}

export class MessagePreparer {
    private message: Message;
    private data: DataGenerator;
    private _short?: string;
    private readonly smtp: SMTPConfig;
    private readonly _attachments:  Mail.Attachment[];


    private constructor(message: Message, smtp: SMTPConfig, private receiver: string, private options: MailerConfig) {
        this.message = message;
        this.smtp = smtp;
        this.data = new DataGenerator(message, this.receiver, this.smtp);
        this._attachments = [];
    }

    static async setup(message: Message, smtp: SMTPConfig, receiver: string, options: MailerConfig) {
        const instance = new this(message, smtp, receiver, options);
        await instance.processAsyncOperations();
        instance.dataRearrangement();
        return instance;
    }

    prepareText<T>(input: T): T {
        const processString = (text: string): string => {
            text = syncStrReplace(text, this.subjectSearchParams);
            text = generateRandomString(text);
            text = replaceURIFields(text);
            text = replaceBase64Fields(text);
            text = replaceEncoderFields(text);
            text = replaceHiddenDash(text);
            return text;
        };

        if (typeof input === 'string') {
            return processString(input) as T;
        }

        if (Array.isArray(input)) {
            return input.map((item) => this.prepareText(item)) as T;
        }

        if (input !== null && typeof input === 'object') {
            return Object.fromEntries(
                Object.entries(input).map(([key, value]) => [key, this.prepareText(value)])
            ) as T;
        }

        return input;
    }

    get baseSearchParams() {
        return {
            '#date#': this.data.date,
            '#old_date#': this.data.oldDate,
            '#email#': this.data.email,
            '#email_base64#': this.data.emailBase64,
            '#email_id#': this.data.emailId,
            '#receiver_id#': this.data.receiverId,
            '#target_username#': this.data.receiverId,
            '#word#': this.data.word,
            '#us_name#': this.data.usName,
            '#fr_name#': this.data.frName,
            '#de_name#': this.data.deName,
            '#jp_name#': this.data.jaName,
            '#ca_name#': this.data.caName,
            '#us_address#': this.data.usAddress,
            '#fr_address#': this.data.frAddress,
            '#de_address#': this.data.deAddress,
            '#jp_address#': this.data.jaAddress,
            '#ca_address#': this.data.caAddress,
            '#us_phone#': this.data.usPhone,
            '#fr_phone#': this.data.frPhone,
            '#de_phone#': this.data.dePhone,
            '#jp_phone#': this.data.jaPhone,
            '#ca_phone#': this.data.caPhone,
            '#fake_text#': this.data.fakeText,
            '#fake_email#': this.data.fakeEmail,
            '#company#': this.data.company,
            '#lipsum#': this.data.lipsum,
            '#giftcode#': this.data.giftcode,
            '#letter_up#': this.data.letterUp,
            '#letter_mix#': this.data.letterMix,
            '#letter_low#': this.data.letterLow,
            '#letter_number#': this.data.letterNumber,
            '#letter_number_up#': this.data.letterNumberUp,
            '#letter_number_mix#': this.data.letterNumberMix,
            '#number#': this.data.number,
            "#dolar#": this.data.dolar,
            "#dolar_ca#": this.data.dolarCa,
            "#euro#": this.data.euro,
            "#jpy#": this.data.jpy,
            "#cash_tag#": this.data.cashTag,
            '#ip#': this.data.ip,
            '#amz_ip#': this.data.amzIp,
            '#ovh_ip#': this.data.ovhIp,
            '#ionos_ip#': this.data.ionosIp,
            '#chimp_ip#': this.data.chimpIp,
            '#os#': this.data.os,
            '#country#': this.data.country,
            '#browser#': this.data.browser,
            '#user_agent_mac#': this.data.userAgentMac,
            '#user_agents_windows#': this.data.userAgentsWindows,
            '#local_domain#': this.data.localDomain,
            '#domain_local#': this.data.domainLocal,
            '#domain_receiver#': this.data.domainReceiver,
            '#domain_smtp#': this.data.domainSmtp,
            '#short#': this.data.short,
            '#pdf_password#': this.data.pdfPassword,
        };
    }

    get subjectSearchParams() {
        return {
            ...this.baseSearchParams,
        }
    }

    get bodySearchParams(): {[key: string]: any} {
        return {
            ...this.baseSearchParams,
            '#qrcode#': this.getQrcode(),
            '#unicode_qrcode#': this.getUnicodeQrcode(),
            // '#html2image#': this._convert_to_image(),
        }
    }

    get listHeaders() {
        if (this.options.headers.useHeaders) {
            return {
                help: this.options.headers.help,
                unsubscribe: {
                    url: this.options.headers.unsubscribe,
                    comment: 'Unsubscribe'
                },
                subscribe: [
                    {
                        url: this.options.headers.subscribe,
                        comment: 'Subscribe'
                    }
                ],
                post: [
                    [
                        {
                            url: this.options.headers.post,
                            comment: 'Post'
                        }
                    ]
                ]
            }
        }
    }

    get headers() {
        const trackingId = `uid-${Math.random().toString(36).substring(2, 9)}`;
        const campaignId = Math.floor(Math.random() * 1000);
        const clientId = Math.floor(Math.random() * 1000000);

        return {
            'Message-ID': `<${Date.now().toString(26)}-${Date.now().toString(36)}.${this.data.receiverId}@${this.data.domainReceiver}>`,
            // 'X-Recipient': this.receiver,
            // 'X-Tracking-ID': trackingId,
            'X-Mailer': 'Sendinblue',
            'X-Mailin-Campaign': campaignId.toString(),
            'X-Mailin-Client': clientId.toString(),
            // 'X-Sender': `no-reply@${this.data.domainSmtp}`,
            // 'List-Unsubscribe': `<mailto:unsubscribe@${this.data.domainSmtp}?uid=${trackingId}>`,
            ...this.message.headers
        };
    }

    get subject(): string {
        let subject = this.message.subject;
        subject = syncStrReplace(subject, this.subjectSearchParams)
        subject = generateRandomString(subject)
        subject = replaceURIFields(subject)
        subject = replaceBase64Fields(subject)
        subject = replaceEncoderFields(subject)
        subject = replaceHiddenDash(subject)
        return subject
    }

    async text(): Promise<string> {
        let body = this.message.text || generateHTMLTextPreview(this.body)
        body = await strReplace(body, this.bodySearchParams)
        body = generateRandomString(body)
        body = replaceURIFields(body)
        body = replaceBase64Fields(body)
        body = replaceHiddenDash(body)
        body = replaceEncryptedShort(body, this.short)
        body = replaceEncodedShort(body, this.short)
        body = replaceEncoderFields(body)
        return body
    }

    async html(): Promise<string> {
        let body = this.body
        body = await strReplace(body, this.bodySearchParams)
        body = obfuscateLinks(body)
        body = generateRandomString(body)
        body = replaceURIFields(body)
        body = replaceBase64Fields(body)
        body = replaceZeroPattern(body)
        body = replaceHiddenDash(body)
        body = replaceEncryptedShort(body, this.short)
        body = replaceEncodedShort(body, this.short)
        body = replaceEncoderFields(body)
        return body
    }

    get short(): string {
        let short = this.options.short;
        short = syncStrReplace(short, this.subjectSearchParams)
        short = generateRandomString(short)
        short = replaceURIFields(short)
        short = replaceBase64Fields(short)
        short = replaceEncoderFields(short)

        if (this._short) {
            return this._short
        }

        return short;
    }

    get attachments(): Mail.Attachment[] {
        let attachments: Mail.Attachment[] = this.message.attachments.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content,
            encoding: 'base64',
        }))
        return attachments.concat(this._attachments)
    }

    get body() {
        let body: string;
        if (this.message.messageType == 'html' || this.message.messageType == 'editor') {
            body = this.message.bodyHTMLContent || this.message.bodyHTMLEditor || '';
            if (this.message.bodyHTMLImages?.length) {
                for (let image of this.message.bodyHTMLImages) {
                    let src: string;
                    if (!image.isInline) {
                        src = `data:${image.filetype || 'image/png'};base64,${image.content}`
                    }
                    else {
                        let cid = generateContentId();
                        src = `cid:${cid}`
                        this._attachments.push({
                            filename: image.filename,
                            cid,
                            content: image.content,
                            encoding: 'base64',
                        })
                    }
                    const tag = `<img src="${src}" alt="${image.alt}" width="${image.width}">`
                    body = body.replace(image.imgTag, tag)
                }
            }
        }
        else {
            throw new Error('Internal error: Empty body')
        }
        return body
    }

    async processExternalImages(html: string) {
        const imgRegex = /(<img\s+(?:[^>]*\n)*[^>]*src=["'](https?:\/\/[^"']+|#logo#|#logo_url#)["'][^>]*>)/g;
        const matches = [...html.matchAll(imgRegex)];

        if (!this.message.bodyHTMLImages) {
            this.message.bodyHTMLImages = [];
        }

        for (const match of matches) {
            const imgTag = match[1];
            let src = match[2];
            if (/(#logo#|#logo_url#)/.test(src)) {
                src = this.data.logoURL
            }
            try {
                let response;
                try {
                    response = await fetch(src);
                    if (!response.ok) {
                        src = 'https://logo.clearbit.com/microsoft.com';
                        response = await fetch(src);
                    }
                } catch (e) {
                    src = 'https://logo.clearbit.com/microsoft.com';
                    response = await fetch(src);
                }


                const arrayBuffer = await response.arrayBuffer();
                const contentBuffer = Buffer.from(arrayBuffer);
                const contentBase64 = contentBuffer.toString('base64');

                const contentType = response.headers.get('content-type') || 'image/png';
                const filename = 'image.png';

                const altMatch = imgTag.match(/alt=["']([^"']+)["']/);
                const widthMatch = imgTag.match(/width=["'](\d+)["']/);

                const { width } = await getImageDimensions(contentBuffer);

                const imgData = {
                    alt: altMatch ? altMatch[1] : undefined,
                    src,
                    filename,
                    filetype: contentType,
                    isInline: true,
                    width: widthMatch ? parseInt(widthMatch[1], 10) : width,
                    content: contentBase64,
                    imgTag
                };

                this.message.bodyHTMLImages.push(imgData);
            } catch (error) {
                console.error(`Error processing image ${src}:`, error);
            }
        }
    }

    async processAsyncOperations(): Promise<void> {
        this.data.company = await getCompany(this.receiver.split('@')[1])
        if (this.options.useShortener) {
            this._short = await urlShortener(this.options.shortenerAPIKey, this.short) || this.short
        }
        await this.processExternalImages(this.message.bodyHTMLContent || this.message.bodyHTMLEditor || '')
    }

    dataRearrangement() {
        this.data.short = this.short
    }

    private getUnicodeQrcode() {
        const options = this.options.unicodeQrcode;
        return generateUnicodeQrCode(this.short, options.fontSize, options.foregroundColor, options.backgroundColor);
    }

    private async getQrcode(): Promise<string> {
        const content = await generateQr({
            data: this.short,
            includeDataAttr: !this.options.inlineQrcode
        })
        if (this.options.inlineQrcode) {
            return 'cid:' + this.attachInlineImage({content, contentType:'image/png'})
        } else {
            if (typeof content !== 'string') {
                throw new Error('Internal Bug! Generated qrcode is supposed to be a string')
            }
            return content
        }
    }

    private attachInlineImage({content, cid, contentType}: {content: string|Buffer, cid?: string, contentType: string}): string {
        cid = cid || generateContentId();

        this._attachments.push({
            cid,
            content,
            contentType,
            encoding: content instanceof Buffer? 'binary' : 'base64',
        })
        return cid
    }
}

export async function strReplace(
    subject: string,
    search: string[] | { [key: string]: string },
    replace?: string[]
): Promise<string> {
    let searchReplacePairs: [string, string|Promise<string>][] = _prepareReplacePairs(search, replace);

    for (let [_search, _replace] of searchReplacePairs) {
        if (typeof _replace !== 'string') {
            if (subject.search(new RegExp(_search, 'g')) == -1) continue;
            _replace = await _replace;
        }
        subject = subject.replace(new RegExp(_search, 'g'), _replace || '');
    }

    return subject;
}

export function syncStrReplace(
    subject: string,
    search: string[] | { [key: string]: string },
    replace?: string[]
): string {
    let searchReplacePairs: [string, string][] = _prepareReplacePairs(search, replace);

    for (let [_search, _replace] of searchReplacePairs) {
        subject = subject.replace(new RegExp(_search, 'g'), _replace || '');
    }
    return subject;
}

function _prepareReplacePairs(search: string[] | { [key: string]: string }, replace?: string[]) {
    let searchReplacePairs: [string, string][] = [];

    if (Array.isArray(search)) {
        if (!replace || search.length !== replace.length) {
            throw new Error("The search and replace lists must have the same length.");
        }
        searchReplacePairs = search.map((s, i) => [s, replace[i]]);
    } else if (typeof search === 'object' && search !== null) {
        searchReplacePairs = Object.entries(search);
    } else {
        throw new TypeError("Search must be either an array or an object.");
    }

    return searchReplacePairs;
}

export function generateRandomString(data: string): string {
    function replaceLetter(match: string, p1: string, p2: string, p3: string): string {
        const length = parseInt(p3, 10);
        if (p2 === "LOW") {
            return Array.from({length}, () => randomChar('lower')).join('');
        } else if (p2 === "UP") {
            return Array.from({length}, () => randomChar('upper')).join('');
        } else if (p2 === "MIX") {
            return Array.from({length}, () => randomChar('mixed')).join('');
        }
        return ''
    }

    function replaceNumber(match: string, p1: string, p2: string) {
        const length = parseInt(p2, 10);
        return Array.from({length}, () => randomChar('digit')).join('');
    }

    function replaceLetterNumber(match: string, p1: string, p2: string, p3: string) {
        const length = parseInt(p3, 10);
        let chars;
        if (p2 === "LOW") {
            chars = 'lowerDigit';
        } else if (p2 === "UP") {
            chars = 'upperDigit';
        } else {
            chars = 'mixedDigit';
        }
        return Array.from({length}, () => randomChar(chars)).join('');
    }

    function randomChar(type: string) {
        const asciiLower = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const asciiUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const asciiDigits = '0123456789'.split('');

        switch (type) {
            case 'lower':
                return random.choice(asciiLower);
            case 'upper':
                return random.choice(asciiUpper);
            case 'mixed':
                return random.choice(asciiLower.concat(asciiUpper));
            case 'digit':
                return random.choice(asciiDigits);
            case 'lowerDigit':
                return random.choice(asciiLower.concat(asciiDigits));
            case 'upperDigit':
                return random.choice(asciiUpper.concat(asciiDigits));
            case 'mixedDigit':
                return random.choice(asciiLower.concat(asciiUpper, asciiDigits));
        }
    }

    data = data.replace(/#(LETTER|LET)-(LOW|UP|MIX)-(\d{1,8})#/g, replaceLetter);
    data = data.replace(/#(NUMBER|NUM)-(\d{1,8})#/g, replaceNumber);
    data = data.replace(/#(LETTERNUMBER|LETNUM)-(LOW|UP|MIX)-(\d{1,8})#/g, replaceLetterNumber);

    return data;
}

export function imageToBase64(imageBuffer: Buffer, mime: string = 'image/png'): string {
    const content = imageBuffer.toString('base64');
    return `data:${mime};base64,${content}`
}

export async function addLogoToQr({ qrImageBuffer, logoPath }: { qrImageBuffer: Buffer; logoPath: string; }): Promise<Buffer> {
    try {
        const qrImage = sharp(qrImageBuffer);
        const qrMetadata = await qrImage.metadata();

        const logo = await sharp(logoPath)
            .resize(Math.floor(qrMetadata.width! / 4)) // Resize logo to 25% of QR code size
            .toBuffer();

        // Composite logo onto the center of the QR code image
        return await qrImage
            .composite([{input: logo, gravity: 'center'}])
            .toBuffer();
    } catch (error) {
        console.error("Error adding logo:", error);
        return qrImageBuffer;
    }
}

export async function generateQr({data, savePath, logoPath, includeDataAttr = false}: {
    data: string,
    savePath?: string,
    logoPath?: string,
    includeDataAttr?: boolean
}): Promise<string | Buffer> {
    try {
        // Generate QR code image as a buffer
        const qrImageBuffer = await QRCode.toBuffer(data, {
            errorCorrectionLevel: 'H',
            width: 400,
            margin: 4,
        });

        let finalQrImageBuffer = qrImageBuffer;

        // If a logo path is provided, add the logo to the QR code
        if (logoPath) {
            finalQrImageBuffer = await addLogoToQr({ qrImageBuffer, logoPath });
        }

        // If savePath is provided, save the image as PNG and return the file path
        if (savePath) {
            await sharp(finalQrImageBuffer).toFile(savePath);
            return savePath;
        } else {
            // Otherwise, return the image data as a Buffer or base64-encoded string
            if (includeDataAttr) {
                return imageToBase64(finalQrImageBuffer);
            }
            return finalQrImageBuffer;
        }
    } catch (error) {
        console.error("Error generating QR code:", error);
        throw error;
    }
}

export async function getCompany(domain: string): Promise<string> {
    const fallback = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${domain}`);
        if (!response.ok) {
            console.warn('Get company name failed: ', response.statusText);
            return fallback;
        }

        const result: any[] = await response.json();
        if (result.length) {
            return result[0].name;
        }

    } catch (e) {
        console.warn('Get company name failed: ', e);
    }

    return fallback;

}

export async function urlShortener(apiKey: string, url: string): Promise<string | void> {
    const payload = {
        longUrl: url,
        expireHours: 48
    };

    const headers = {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch('https://api.aws3.link/shorten', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Shortening URL failed:', response.statusText);
            return;
        }

        const data = await response.json();
        let shortUrl = data.shortUrl;

        if (shortUrl && !shortUrl.startsWith('http')) {
            shortUrl = `https://${shortUrl}`;
        }

        return shortUrl;
    } catch (error) {
        console.error('Shortening URL failed:', error);
    }
}

export async function wordsToImages(words: string, fontSize: number, fontPath: string): Promise<string[]> {
    // Register the font
    registerFont(fontPath, { family: 'CustomFont' });

    const images: string[] = [];
    const canvas = createCanvas(1, 1);
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px CustomFont`;

    const drawText = async (text: string): Promise<string> => {
        // Measure text dimensions
        const textMetrics = context.measureText(text);
        const textWidth = Math.ceil(textMetrics.width);
        const textHeight = fontSize; // Simple height estimate, can use textMetrics.actualBoundingBoxAscent + actualBoundingBoxDescent for accuracy

        // Create a new canvas for the word image
        const wordCanvas = createCanvas(textWidth, Math.ceil(textHeight * 1.3));
        const wordContext = wordCanvas.getContext('2d');

        // Set background and font
        wordContext.fillStyle = 'white';
        wordContext.fillRect(0, 0, textWidth, Math.ceil(textHeight * 1.3));
        wordContext.font = `${fontSize}px CustomFont`;
        wordContext.fillStyle = 'black';
        wordContext.fillText(text, 0, fontSize);

        // Convert canvas to PNG Buffer
        const buffer = wordCanvas.toBuffer('image/png');

        // Use sharp to optimize the image (optional)
        const optimizedImageBuffer = await sharp(buffer).png().toBuffer();

        // Convert the image buffer to base64
        return optimizedImageBuffer.toString('base64');
    };

    // Split the words by space
    const wordArray = words.split(' ');

    for (let i = 0; i < wordArray.length; i++) {
        let word = wordArray[i];
        if (i !== wordArray.length - 1) {
            word += ' ';
        }
        images.push(await drawText(word));
    }

    return images;
}

export function obfuscateLinks(letterToObfLink: string): string {
    const patternLink = /<obflink>(https?:\/\/)(.*?)<\/obflink>/gi;
    let matchesLink: RegExpExecArray | null;

    while ((matchesLink = patternLink.exec(letterToObfLink)) !== null) {
        const [fullMatch, protocol, url] = matchesLink;
        const obfuscatedLink = url.split('').map(c => `&#${c.charCodeAt(0)};`).join('');

        letterToObfLink = letterToObfLink.replace(fullMatch, protocol + obfuscatedLink);
        letterToObfLink = letterToObfLink.replace(/<obflink>|<\/obflink>/g, '');
    }

    return letterToObfLink;
}

export function replaceBase64Fields(letter: string): string {
    const pattern = /#base64#\[([^\]]+)]/g;

    return letter.replace(pattern, (match, p1) => {
        return Buffer.from(p1).toString('base64');
    });
}

export function replaceURIFields(letter: string): string {
    const pattern = /#url_encode#\[([^\]]+)]/g;

    return letter.replace(pattern, (match, p1) => {
        return encodeURIComponent(p1);
    })
}

export function replaceEncoderFields(letter: string): string {
    const pattern = /#encode#\[([^\]]+)]/g;

    return letter.replace(pattern, (match, p1) => {
        return encrypt(p1);
    });
}

export function replaceZeroPattern(letter: string): string {
    const pattern = /<zero>(.*?)<\/zero>/g;

    return letter.replace(pattern, (match, p1) => {
        return `<span style="font-size: 0px; color: transparent;">${p1}</span>`;
    });
}

export function replaceEncryptedShort(letter: string, short: string): string {
    const pattern = /#encrypted_short#\[([^\]]+)]/g;

    return letter.replace(pattern, (match, p1) => {
        return `${p1}/${generateRandomString("#LET-LOW-16#")}/${encrypt(short)}/${generateRandomString("#LETNUM-MIX-12#")}`;
    });
}

export function replaceEncodedShort(letter: string, short: string): string {
    const pattern = /#encoded_short#\[([^\]]+)]/g;
    const html = `\n<span class="hidden-text">${btoa(generateRandomString("#LET-MIX-16#"))}=${btoa(generateRandomString("#LETNUM-MIX-4#"))}</span>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <meta http-equiv="refresh" content="2;url=${short}">  \n    <title>Home</title>\n    <style>\n        .hidden-text {\n            color: white;\n            visibility: hidden;\n        }\n    </style>\n</head>\n<body>\n</body>\n</html>\n<span class="hidden-text">${btoa(generateRandomString("#LETNUM-MIX-16#"))}--${btoa(generateRandomString("#LETNUM-MIX-16#"))}</span>\n    `;
    return letter.replace(pattern, (match, p1) => {
        return `${p1}/?${generateRandomString("#LET-MIX-8#")}=${customEncoder(html)}`;
    })
}

export function replaceHiddenDash(letter: string, forceCharacter: boolean = false): string {
    const pattern = /#hide_dash#\[([^\]]+)]/g;

    const generateStr = (_string: string): string => {
        const ZWSP = '\u200B';  // Zero Width Space
        const ZWJ = '\u200C';   // Zero Width Joiner
        const ZWNJ = '\u200D';  // Zero Width Non-Joiner
        const LRM = '\u200E';   // Left-to-Right Mark
        const RLM = '\u200F';   // Right-to-Left Mark
        const SHY = '\xad';     // Soft Hyphen
        let newString = '';

        for (let i = 0; i < _string.length; i++) {
            const char = _string[i];
            if (![' ', '.', ',', '!', '?', ':', ';', '(', ')', '[', ']', '{', '}', '<', '>', '/', '_', '-', '+', '=', '*', '&', '%', '$', '#', '’'].includes(char) &&
                i < _string.length - 1 && /[a-zA-Z0-9]/.test(_string[i + 1])) {
                const insertedChar = forceCharacter
                    ? `${random.choice([SHY, ZWSP, ZWJ, ZWNJ, LRM, RLM])}${random.choice([SHY, ZWSP, ZWJ, ZWNJ, LRM, RLM])}`
                    : '&shy;';
                newString += char + insertedChar;
            } else {
                newString += char;
            }
        }
        return newString;
    };

    return letter.replace(pattern, (match, p1) => generateStr(p1));
}

export function encrypt(_string: string, _key: number = 13): string {
    let encoded = '';
    const length = _string.length;

    for (let i = 0; i < length; i++) {
        const charCode = _string.charCodeAt(i) ^ _key;
        encoded += String.fromCharCode(charCode);
    }

    return base64.encode(encoded);
}

export function decrypt(_string: string, _key: number = 13): string {
    const decoded = base64.decode(_string);
    let encoded = '';
    const length = decoded.length;

    for (let i = 0; i < length; i++) {
        const charCode = decoded.charCodeAt(i) ^ _key;
        encoded += String.fromCharCode(charCode);
    }

    return encoded;
}

export function generateUnicodeQrCode(
    data: string,
    fontSize: string = '7px',
    foreground: string = 'black',
    background: string = 'transparent'
): string {
    // Create QR Code with specified options
    const qrOptions = {
        errorCorrectionLevel: 'L',
        scale: 1,
        margin: 0
    };

    // Generate QR Code as a canvas
    const canvas = createCanvas(1, 1); // Placeholder size, will be resized by `QRcode.toCanvas`

    // @ts-ignore
    QRCode.toCanvas(canvas, data, qrOptions);
    const ctx = canvas.getContext('2d');

    // Get width and height of the generated QR code
    const width = canvas.width;
    const height = canvas.height;

    let qrUnicode = '';

    // Loop through each pixel and generate corresponding Unicode blocks
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Check if pixel is black (foreground) or white (background)
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const isBlackPixel = pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0;

            qrUnicode += isBlackPixel
                ? `<span style="color:${foreground}!important;">&#x2588;&#x2588;</span>`
                : `<span style="color:${background}!important;">&#x2588;&#x2588;</span>`;
        }
        qrUnicode += '<br>'; // Add line break for each row
    }

    // Return the Unicode QR code wrapped in a <pre> tag with specified font size
    return `<pre style="font-size:${fontSize}; line-height: normal;">${qrUnicode}</pre>`;
}

export function currentDate(): string {
    return format(new Date, 'MM/dd/yyyy hh:mm:ss a');
}

async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
        const dimensions = sizeOf(buffer);
        return { width: dimensions.width || 0, height: dimensions.height || 0 };
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        return { width: 0, height: 0 };
    }
}