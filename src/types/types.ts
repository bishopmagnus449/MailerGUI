import {SendMailOptions} from 'nodemailer'
import Mail from "nodemailer/lib/mailer";

export interface HTMLImage {
    alt?: string,
    src?: string,
    filename?: string,
    filetype?: string,
    isInline: boolean,
    cid?: string,
    width?: number,
    content?: string,
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
    attachments: Attachment[],
    messageType: MessageType,
    bodyHTMLFile?: File,
    bodyHTMLContent?: string,
    bodyHTMLImages?: HTMLImage[],
    bodyHTMLEditor?: string,
    bodyRawFile?: File,
    bodyRawContent?: string,
    headers: SendMailOptions,
}

export interface SMTPConfig {
    host: string,
    port: number,
    user?: string,
    pass?: string,
    from: Mail.Address,
    proxy?: string,
}

type ProxyProtocol = 'http' | 'socks5'
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
    proxy: {
        useProxy: boolean,
        protocol: ProxyProtocol,
        host: string,
        port: number,
    },
    headers: {
        useHeaders: boolean,
        unsubscribe?: string,
        subscribe?: string,
        post?: string,
        help?: string,
    },
}

type WebSocketLogType = 'log' | 'success' | 'info' | 'warning' | 'danger' | 'progress' | 'reset'

interface WebSocketBase {
    type: WebSocketLogType,
    message?: any,
}

interface WebSocketProgress {
    type: 'progress',
    message: number,
    options?: any
}

export type WebsocketLog = WebSocketBase | WebSocketProgress;

export type Step = 'config' | 'smtp' | 'message' | 'receivers' | 'progress'