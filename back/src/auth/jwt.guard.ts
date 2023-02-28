import {AuthGuard} from "@nestjs/passport";
import {Reflector} from "@nestjs/core";
import {ExecutionContext, SetMetadata} from "@nestjs/common";

export const IS_DISABLED_AUTH_KEY = 'isDisabledAuth';
export const DisabledAuth = () => SetMetadata(IS_DISABLED_AUTH_KEY, true);

export class JwtGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isDisabledAuth = this.reflector.getAllAndOverride<boolean>(
            IS_DISABLED_AUTH_KEY,
            [
                context.getHandler(),
                context.getClass()
            ]);

        if (isDisabledAuth) {
            return true;
        }

        return super.canActivate(context);
    }

}