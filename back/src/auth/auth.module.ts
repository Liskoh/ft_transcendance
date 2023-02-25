/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tnguyen- <tnguyen-@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 02:03:59 by tnguyen-          #+#    #+#             */
/*   Updated: 2023/02/25 16:07:00 by tnguyen-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
	imports:[
		UserModule
	],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
