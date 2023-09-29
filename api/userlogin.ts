import {VercelRequest, VercelResponse} from '@vercel/node';
import {sql} from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

const SECRETKEY = process.env.SECERT_KEY;

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
        const user = results.rows[0];

        if (!user) {
            return response.status(200).send('-1');
        }

        if (user.password === password) {
            const token = jwt.sign(
                {
                    user_id: user.id,
                    time: Math.floor(Date.now() / 1000) // 添加time字段
                },
                SECRETKEY,
                {expiresIn: '1h', algorithm: 'HS256'}
            );
            response.setHeader('Set-Cookie', cookie.serialize('authToken', token, {
                maxAge: 3600,
                path: '/',
            }));
            return response.status(200).send('0');
        }
        else{
            return response.status(200).send('1');
        }
    } catch (error) {
        // console.error(error);
        return response.status(502).json({error: 'An error occurred while processing your request'});
    }
}
