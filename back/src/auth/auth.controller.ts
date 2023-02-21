/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tnguyen- <tnguyen-@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/20 01:53:36 by tnguyen-          #+#    #+#             */
/*   Updated: 2023/02/21 02:12:40 by tnguyen-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Post, Body, UseGuards, Req } from "@nestjs/common";
import { CreateAuthDto } from "./dtos/auth.dto";
import { AuthService } from "./auth.service";

@Controller('auth') 
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('auth')
	createAuth(@Body() createAuthDto: CreateAuthDto) {
		createAuthDto.client_id = "test";
	}
}

