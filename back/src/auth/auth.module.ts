import { Module } from '@nestjs/common';
import { Auth42Service } from './auth42.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";
import {APP_GUARD} from "@nestjs/core";

@Module({
	imports:[
		UserModule,
		JwtModule.register({
			secret: 'secret',
			// signOptions: { expiresIn: '60s' },
		}),
		PassportModule
	],
  providers: [
	  Auth42Service,
	  JwtStrategy,
	  {
		  provide: APP_GUARD,
		  useClass: JwtStrategy,
	  }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
