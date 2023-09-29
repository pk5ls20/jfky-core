import {VercelRequest, VercelResponse} from '@vercel/node';
import {sql} from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

interface WorkInfo {
    id: string;
    name: string;
    author: string;
    time: number;
    prompt: string;
    info: string;
    pic: Array<string>;
}
const SECRETKEY = process.env.SECERT_KEY;
export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        const token = extractToken(request);
        if (!token) throw new Error('Token is missing');
        const current_time = Math.floor(Date.now() / 1000);
        // console.log('Current Time:', current_time);
        const payload: any = jwt.verify(token, SECRETKEY, {algorithms: ['HS256']});
        const token_time = payload.time || 0;
        // console.log('Token Time:', token_time);
        if (Math.abs(token_time - current_time) > 3600) {
            return response.status(401).json(
                {
                    error: 'Token has expired!',
                    debug: {
                        token_time: token_time,
                        current_time: current_time,
                    }
                });
        }
        const {id, name, author, time, prompt, info, pic} = request.body as { id: string; name: string; author: string; time: number; prompt: string; info: string; pic: Array<string> };
        const results = await sql<WorkInfo[]>`INSERT INTO "items" (id, name, author, time, prompt, info, pic)
                                              VALUES (${id}, ${name}, ${author}, ${time}, ${prompt}, ${info}, ${pic})`;

        if (!results) throw new Error('User not found');
        return response.status(200).json({success: true});
    } catch (error) {
        // console.error(error);
        return response.status(401).json({error: error.message});
    }
}


function extractToken(request: VercelRequest) {
    const rawToken = request.query.token as string;
    const authToken = request.cookies?.authToken;
    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    return token || authToken || rawToken;
}

