import {VercelRequest, VercelResponse} from '@vercel/node';
import {sql} from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

interface WorkInfo {
    self_id: string;
    self_name: string;
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
        const payload: any = jwt.verify(token, SECRETKEY, {algorithms: ['HS256']});
        const token_time = payload.time || 0;
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
        const results = await sql<WorkInfo[]>`SELECT *
                                              FROM "items"
                                              ORDER BY id;
        `;
        if (!results) throw new Error('User not found');
        const works = results.rows;
        return response.status(200).json(works);
    } catch (error) {
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

