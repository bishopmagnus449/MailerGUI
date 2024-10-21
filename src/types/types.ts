export interface HTMLImage {
    alt: string,
    src: string,
    filename: string | undefined,
    filetype: string | undefined,
    isInline: boolean,
    cid: string | undefined,
    width: number | undefined,
    content: string | undefined,
    isProcessed: boolean,
    imgTag: string,
    file: File | undefined,
}

export interface Attachment {
    filename: string,
    filetype?: string,
    size?: number,
    content: string,
    file: File,
}

type MessageType = 'html' | 'raw' | 'editor';

export interface Message {
    subject: string,
    body?: string,
    attachments: Attachment[],
    messageType: MessageType,
    bodyHTMLFile?: File,
    bodyHTMLContent?: string,
    bodyHTMLImages?: HTMLImage[],
}

export interface SMTPConfig {
    host: string,
    port: number,
    user?: string,
    pass?: string,
    from?: string,
    proxy?: string,
}

export interface MailerConfig {
    short: string,
    workers: number,
    useShortener: boolean,
    shortenerAPIKey: string,
    inlineQrcode: boolean,
    unicodeQrcode: {
        fontSize: string,
        foregroundColor: string,
        backgroundColor: string,
    },
}

type WebSocketLogType = 'log' | 'success' | 'info' | 'warning' | 'danger' | 'progress' | 'reset'
export interface WebsocketLog {
    type: WebSocketLogType,
    message?: any,
}

export type Step = 'config' | 'smtp' | 'message' | 'receivers' | 'progress'