import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/core/prisma/prisma.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsAuthorityHelper {
  constructor(private readonly prismaService: PrismaService) {}

  checkIdentification(postId: number, userId: number): Promise<Post | null> {
    return this.prismaService.post.findFirst({
      where: {
        userId,
        id: postId,
      },
    });
  }
}