/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tnguyen- <tnguyen-@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/20 01:53:36 by tnguyen-          #+#    #+#             */
/*   Updated: 2023/02/25 12:13:34 by tnguyen-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Post, Body, Param, UseGuards, Req } from "@nestjs/common";
import { CreateAuthDto } from "./dtos/auth.dto";
import { AuthService } from "./auth.service";
import axios from "axios";
import { ConfigModule } from "@nestjs/config";

@Controller('auth') 
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('auth')
	createAuth(@Body() createAuthDto: CreateAuthDto) {
		createAuthDto.client_id = "test";
	}
	
	@Get('intra')
	async connectIntra(@Req() req) {
		const code = req.query.code
		if (typeof code !== 'string')
			return;
		const data = {
			code,
			client_id: '' + process.env.CLIENT_ID,
			client_secret: '' + process.env.CLIENT_SECRET,
			grant_type: "authorization_code",
			redirect_uri: "http://localhost:8000/auth/intra"
		}
		const reqToken = await axios.post('https://api.intra.42.fr/oauth/token', data)
		const info = await axios.get('https://api.intra.42.fr/v2/me', {headers: {Authorization: `Bearer ${reqToken.data.access_token}`}})
		return `Hello ${info.data.login}`
	}
}

