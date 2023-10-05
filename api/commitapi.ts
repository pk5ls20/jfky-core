import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRETKEY = process.env.SECERT_KEY;

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    try {
        console.log(process.env.SECRET_KEY);
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

        const {data} = await axios.get('https://api.github.com/repos/pk5ls20/jfky-core/commits', {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_REPO_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        const commits = data.map((commit: { sha: string, commit: { message: string; author: { date: any; }; }; }) => {
            const messageLines = commit.commit.message.split('\n');
            const title = messageLines.shift();
            const content = messageLines.join('\n');
            return {
                timestamp: commit.commit.author.date,
                title,
                content,
                sha: commit.sha.substring(0, 7),
            };
        });
        return response.status(200).send(commits);
    } catch (error) {
        console.error(error);
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
