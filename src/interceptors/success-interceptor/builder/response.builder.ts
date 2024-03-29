import { Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_SIZE } from '@src/constants/constant';
import { ERROR_CODE } from '@src/constants/error-response-code.constant';
import { PageDto } from '@src/dtos/page.dto';
import { HttpInternalServerErrorException } from '@src/http-exceptions/exceptions/http-internal-server-error.exception';
import { DeleteResponseDto } from '@src/interceptors/success-interceptor/dto/delete-response.dto';
import { DetailResponseDto } from '@src/interceptors/success-interceptor/dto/detail-response.dto';
import { PaginationResponseDto } from '@src/interceptors/success-interceptor/dto/pagination-response.dto';

interface Res {
  data: unknown;
  key: string;
}

@Injectable()
export class ResponseBuilder {
  detail(res: Res) {
    const { key, data } = res;

    return new DetailResponseDto({
      [key]: data,
    });
  }

  delete(res: Pick<Res, 'data'>) {
    const { data } = res;

    if (typeof data !== 'number') {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'delete response build 중 number type 이 아님',
      });
    }

    if (!Number.isInteger(data)) {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'delete response build 중 integer format 이 아님',
      });
    }

    return new DeleteResponseDto(data);
  }

  pagination(res: Res, pageDto: PageDto) {
    const { key, data } = res;

    if (!Array.isArray(data)) {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'pagination response build 중 data 가 array type 이 아님',
      });
    }

    const [array, totalCount] = data;

    if (!Array.isArray(array)) {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'pagination response build 중 조회된 객체가 array type 이 아님',
      });
    }

    if (typeof totalCount !== 'number') {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'pagination response build 중 totalCount 가 number type 이 아님',
      });
    }

    if (!Number.isInteger(totalCount)) {
      throw new HttpInternalServerErrorException({
        errorCode: ERROR_CODE.CODE001,
        log: 'pagination response build 중 totalCount 가 integer format 이 아님',
      });
    }

    const currentPage = Number(pageDto.page) || 1;
    const pageSize = Number(pageDto.pageSize) || DEFAULT_PAGE_SIZE;
    const nextPage = pageSize * currentPage < totalCount ? pageSize + 1 : null;
    const hasNext = pageSize * currentPage < totalCount;
    const lastPage = Math.ceil(totalCount / pageSize);

    return new PaginationResponseDto(
      { [key]: array },
      {
        totalCount,
        currentPage,
        pageSize,
        nextPage,
        hasNext,
        lastPage,
      },
    );
  }
}
