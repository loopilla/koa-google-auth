import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaSession from 'koa-session';
import * as bodyParser from 'koa-bodyparser';
import * as queryString from 'querystring';
import { GoogleAuth } from './google.auth';
import { isAuthenticated } from './auth';

class Application {
    private koa = new  Koa();
    private router = new KoaRouter();

    constructor() {
        this.init();
    }

    public init = () => {
        this.koa.use(bodyParser());
        this.koa.keys = ['token'];

        this.koa.use(KoaSession(this.koa));

        console.log(`Token: ${process.env['CLIENTID']}`);

        this.router.get('/login', async (ctx: any) => {
            ctx.redirect(GoogleAuth.getAuthUrl({
                client_id: process.env['CLIENTID'],
                redirect_uri: 'http://localhost:3000/googleclb'
            }));
        });

        this.router.get('/home', isAuthenticated, async (ctx: any) => {
            const queryObj = queryString.parse(ctx.request.querystring);
            const profile = await GoogleAuth.getProfile(ctx, {
                token: queryObj.token
            });
            ctx.body = `${JSON.stringify(profile, null, 2)}`;
        });

        this.router.get('/googleclb', async (ctx: any) => {
            const queryObj = queryString.parse(ctx.request.querystring);
            const config = {
                client_id: process.env['CLIENTID'],
                client_secret: process.env['SECRET'],
                grant_type: 'authorization_code',
                code: queryObj.code,
                redirect_uri: 'http://localhost:3000/googleclb'
            };
            const token = await GoogleAuth.getToken(ctx, config);

            ctx.session.token = token.access_token;
            ctx.session.isLoggedIn = true;
            ctx.redirect(`http://localhost:3000/home?token=${token.access_token}`);
        });
        this.koa.use(this.router.routes());

        this.koa.listen(3000, () => console.log('Server running.\nOpen in browser: http://localhost:3000/login'))
    }
}

export default new Application();
