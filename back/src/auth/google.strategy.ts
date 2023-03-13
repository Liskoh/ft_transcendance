import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallBack } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: '528889728241-mpeohjgb4ud44v5vnq2ik8q9mhrnetmp.apps.googleusercontent.com',
            clientSecret: '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\n',
            callbackURL: 'http://localhost:5173/view/RedirectView', // Replace this with your own callback URL
            scope: ''
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done:
        VerifyCallBack): Promise<any> {
        const {name, emails, photos} = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken
        }
        done(null, user);
    }
}