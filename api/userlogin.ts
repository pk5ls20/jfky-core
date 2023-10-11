import {VercelRequest, VercelResponse} from '@vercel/node';
import {sql} from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import CryptoJS from 'crypto-js';

interface User {
    userlevel: number;
    id: number;
    username: string;
    email: string;
    password: string;
}

const SECRETKEY = process.env.SECERT_KEY;
console.log(process.env.INVITE_KEY);

function encrypt(message: string, key: string): string {
    return CryptoJS.AES.encrypt(message, key).toString();
}

function decrypt(ciphertext: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        const {qq, password} = request.body as { qq: string; password: string };
        const results: { rows: User[] } =
            await sql`SELECT *
                      FROM "users"
                      WHERE qq = ${qq}`;
        console.log(results);
        const user = results.rows[0];
        const userLevel = user.userlevel;
        if (!user) {
            return response.status(200).send('-1');
        }

        // @ts-ignore
        if (user.password === password) {
            const token = jwt.sign(
                {
                    user_id: user.id,
                    time: Math.floor(Date.now() / 1000) // 添加time字段
                },
                SECRETKEY,
                {expiresIn: '1h', algorithm: 'HS256'}
            );
            const plainText = generateRandomString(14) + userLevel.toString() + generateRandomString(14);
            const authPermissionText = encrypt(plainText, SECRETKEY);
            const authTokenCookie = cookie.serialize('authToken', token, {
                maxAge: 3600,
                path: '/',
            });
            const authPermissionCookie = cookie.serialize('authPermission', authPermissionText, {
                maxAge: 3600,
                path: '/',
            });
            response.setHeader('Set-Cookie', [authTokenCookie, authPermissionCookie]);
            console.log(decrypt(authPermissionText, SECRETKEY))
            return response.status(200).send('0');
        } else {
            return response.status(200).send('1');
        }
    } catch (error) {
        // console.error(error);
        return response.status(502).json({error: 'An error occurred while processing your request'});
    }
}
