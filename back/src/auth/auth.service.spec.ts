/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.service.spec.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tnguyen- <tnguyen-@student.42lyon.fr>      +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 02:04:05 by tnguyen-          #+#    #+#             */
/*   Updated: 2023/02/21 02:04:05 by tnguyen-         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Test, TestingModule } from '@nestjs/testing';
import { Auth42Service } from './auth42.service';

describe('AuthService', () => {
  let service: Auth42Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Auth42Service],
    }).compile();

    service = module.get<Auth42Service>(Auth42Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
