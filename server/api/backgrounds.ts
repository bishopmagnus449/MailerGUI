import {promises as fs} from 'fs';
import path from 'path';
import { getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const query: {theme: string} = getQuery(event);
    if (!query.theme) {
        return [];
    }
    const backgroundsDir = path.resolve(process.cwd(), `public/background/${query.theme.toLowerCase()}`);

    try {
        const files = await fs.readdir(backgroundsDir);
        const images = files.filter(file => /\.(png|jpg|jpeg|gif|svg)$/.test(file));
        return images.map(image => `/background/${query.theme.toLowerCase()}/${image}`)
    } catch (err: any) {
        return {
            error: 'Unable to read backgrounds directory',
            details: err.message
        };
    }
});