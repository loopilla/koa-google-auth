import { IncomingMessage, RequestOptions } from 'http';
import * as https from 'https';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth?';
const GOOGLE_TOKEN_ENDPOINT = 'oauth2.googleapis.com';

export class GoogleAuth {
    static getAuthUrl = (options: any): string =>
        [
            GOOGLE_AUTH_ENDPOINT,
            `response_type=${options.reponse_type || 'code'}&`,
            `client_id=${encodeURIComponent(options.client_id)}&`,
            `redirect_uri=${encodeURIComponent(options.redirect_uri || 'http://localhost:3000/googleclb')}&`,
            `scope=${encodeURIComponent(options.scope || 'openid profile email')}`
        ].join('');

    static async getToken(ctx: any, options: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const url: string = [
                `code=${options.code}`,
                `client_id=${options.client_id}`,
                `redirect_uri=${options.redirect_uri}`,
                `client_secret=${options.client_secret}`,
                `grant_type=${options.grant_type}`
            ].join('&');

            const requestOptions: RequestOptions = {
                hostname: GOOGLE_TOKEN_ENDPOINT,
                port: 443,
                path: `/token?${url}`,
                method: 'POST',
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                }
            };

            const req = https.request(requestOptions, (res: IncomingMessage) => {
                res.setEncoding('utf8');
                const chunks: string[] = [];

                res.on('data', (data: string) => {
                    chunks.push(data);
                });

                res.on('end', (data: string) => {
                    const body = chunks.join('');
                    const tobj = JSON.parse(body.toString());
                    resolve(tobj);
                });

                res.on('error', (error: any) => {
                    console.log(error);
                    reject(error);
                });
            });
            req.end();
        })
    }

    static async getProfile(ctx: any, options: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const requestOptions: RequestOptions = {
                headers: {
                    Authorization: `Bearer ${options.token}`,
                    Accept: 'application/json'
                }
            };

            const request = https.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${options.token}`, (res: IncomingMessage) => {
                const chunks: string[] = [];
                res.setEncoding('utf-8');

                res.on('data', (data: any) => {
                    chunks.push(data);
                });

                res.on('end', (data: any) => {
                    const body = chunks.join('');
                    const tobj = JSON.parse(body.toString());
                    resolve(tobj);
                });

                res.on('error', (data: any) => {
                    reject(data);
                });
            });
            request.end();
        });
    }
}
