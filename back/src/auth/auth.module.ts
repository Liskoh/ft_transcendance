import {forwardRef, Module} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";
import {APP_GUARD} from "@nestjs/core";

@Module({
	exports: [AuthService],
	imports:[
		forwardRef(() => UserModule),
		JwtModule.register({
			secret: 'secret',
			// signOptions: { expiresIn: '60s' },
		}),
		PassportModule
	],
  providers: [
	  AuthService,
	  JwtStrategy,
	  {
		  provide: APP_GUARD,
		  useClass: JwtStrategy,
	  }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
