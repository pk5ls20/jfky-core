import {VercelRequest, VercelResponse} from '@vercel/node';
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import jwt from 'jsonwebtoken';

const S3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

function extractToken(request) {
    const rawToken = request.query.token;
    const authToken = request.cookies?.authToken;
    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    return token || authToken || rawToken;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    const token = extractToken(req);
    if (!token) throw new Error('Token is missing');
    const current_time = Math.floor(Date.now() / 1000);
    const payload: any = jwt.verify(token, process.env.SECERT_KEY, {algorithms: ['HS256']});
    const token_time = payload.time || 0;
    if (Math.abs(token_time - current_time) > 3600) {
        return res.status(401).json(
            {
                error: 'Token has expired!',
                debug: {
                    token_time: token_time,
                    current_time: current_time,
                }
            });
    }
    // 获取文件名和内容
    const fileName = String(req.headers['x-file-name']);
    const fileContentType = String(req.headers['x-content-type']);
    const fileContent = req.body;  // 请求体包含文件的二进制数据
    // 定义 S3 上传参数
    const params = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: fileContentType,
    });
    try {
        // 上传文件到 S3
        const data = await S3.send(params);
        if (data) {
            res.status(200).json({
                success: true
            });
        } else {
            res.status(500).send('null');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Internal Server Error');
    }
}