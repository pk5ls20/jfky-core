import {VercelRequest, VercelResponse} from '@vercel/node';
import {sql} from '@vercel/postgres';

interface WorkInfo {
    qq: string;
    name: string;
    password: string;
}

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        const SECRETKEY = process.env.INVITE_KEY
        const {qq, username, password, inviteNum} = request.body as { qq: string; username: string; password: string, inviteNum: string };
        if (inviteNum !== SECRETKEY) response.status(200).send('-114514');
        const results = await sql<WorkInfo[]>`INSERT INTO "users" (qq, username, password)
                                              VALUES (${qq}, ${username}, ${password})`;
        if (results) return response.status(200).send('0');
    } catch (error) {
        // console.error(error);
        return response.status(401).json({error: error.message});
    }
}


