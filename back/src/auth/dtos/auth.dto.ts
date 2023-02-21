/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.dto.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tnguyen- <tnguyen-@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/20 01:51:01 by tnguyen-          #+#    #+#             */
/*   Updated: 2023/02/21 01:46:35 by tnguyen-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class CreateAuthDto {
  client_id: string;
  redirect_uri: string;
}