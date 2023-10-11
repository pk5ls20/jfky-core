import {VercelRequest, VercelResponse} from '@vercel/node';
import {QueryResult, sql} from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import CryptoJS from "crypto-js";

interface WorkInfo {
    id: string;
    user_id: number;
}

const SECRETKEY = process.env.SECERT_KEY;

function decrypt(ciphertext: string, key: string): boolean {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptString = bytes.toString(CryptoJS.enc.Utf8);
    console.log(decryptString[14]);
    return decryptString[14] === '1';
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        const token = extractToken(request);
        console.log(request.cookies?.authPermission);
        if (!decrypt(request.cookies?.authPermission || '', process.env.SECERT_KEY || '')) {
            return response.status(401).json({error: 'Permission denied'});
        }
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
        const {id, user_id} = request.body as {
            id: number;
            user_id: number;
        };
        const results1 = await sql<WorkInfo[]>`DELETE
                                               FROM "items"
                                               WHERE id = ${id}`;
        console.log(results1);
        if (!results1) throw new Error('Database operation failed');
        return response.status(200).json({success: true});
    } catch (error) {
        // console.error(error);
        return response.status(500).json({error: error.message});
    }
}


function extractToken(request: VercelRequest) {
    const rawToken = request.query.token as string;
    const authToken = request.cookies?.authToken;
    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    return token || authToken || rawToken;
}

