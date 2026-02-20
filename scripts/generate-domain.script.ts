/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { exec } from 'child_process';
import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline/promises';
import camelCase from 'to-camel-case';
import pascalCase from 'to-pascal-case';
import snakeCase from 'to-snake-case';

const program = new Command();

const runCommand = (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        console.error(stderr);
        reject(error);
        return;
      }
      if (stdout.length > 0) {
        console.log(stdout);
      }
      resolve();
    });
  });
};

const createdFiles: string[] = [];

const toReconfiguredText = (preset: string, dir: string, domain: string) => {
  const REGEXP_MAP = [
    ['dir-name', dir],
    ['domain-name', domain],
    ['DomainName', pascalCase(domain)],
    ['domainName', camelCase(domain)],
    ['DOMAIN_NAME', snakeCase(domain).toUpperCase()],
    ['domain_name', snakeCase(domain)],
  ] as const;

  return REGEXP_MAP.reduce((acc, [key, value]) => {
    const regexp = new RegExp(key, 'gm');
    return acc.replace(regexp, value);
  }, preset);
};

const writeFileIfAbsent = (
  filePath: string,
  preset: string,
  dir: string,
  domain: string,
) => {
  if (existsSync(filePath)) {
    console.log(`already exist file ${filePath}`);
    return;
  }

  writeFileSync(filePath, toReconfiguredText(preset, dir, domain));
  createdFiles.push(filePath);
  console.log(`generate file ${filePath}`);
};

const generateDirs = (rootDir: string) => {
  const dirs = [
    rootDir,
    path.join(rootDir, 'assemblers'),
    path.join(rootDir, 'domain'),
    path.join(rootDir, 'domain', '__spec__'),
    path.join(rootDir, 'dto'),
    path.join(rootDir, 'errors'),
    path.join(rootDir, 'event'),
    path.join(rootDir, 'mappers'),
    path.join(rootDir, 'repositories'),
    path.join(rootDir, 'repositories', '__spec__'),
    path.join(rootDir, 'use-cases'),
  ];

  for (const dirPath of dirs) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`ensure dir ${dirPath}`);
  }
};

const ensureDomainModule = (dir: string) => {
  const modulePath = path.resolve(
    process.cwd(),
    'src',
    'modules',
    dir,
    `${dir}.module.ts`,
  );

  const PRESET = `
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [],
})
export class DomainNameModule {}
`;

  writeFileIfAbsent(modulePath, PRESET, dir, dir);

  return {
    modulePath,
    created: createdFiles.includes(modulePath),
  };
};

const upsertProviderToModule = (
  modulePath: string,
  importLines: string[],
  providerToken: string,
  providerClass: string,
) => {
  const source = readFileSync(modulePath, 'utf8');
  let next = source;

  for (const importLine of importLines) {
    if (!next.includes(importLine)) {
      next = `${importLine}\n${next}`;
    }
  }

  const providerEntry = `{\n      provide: ${providerToken},\n      useClass: ${providerClass},\n    }`;
  const providersArrayRegex = /providers:\s*\[([\s\S]*?)\]/m;
  const providersMatch = next.match(providersArrayRegex);

  if (providersMatch !== null) {
    const currentItemsText = providersMatch[1];
    const alreadyRegistered =
      currentItemsText.includes(`provide: ${providerToken}`) ||
      currentItemsText.includes(`useClass: ${providerClass}`);

    if (!alreadyRegistered) {
      const trimmed = currentItemsText.trimEnd();
      const hasItems = trimmed.trim().length > 0;
      const normalized = hasItems
        ? `${trimmed}${trimmed.trim().endsWith(',') ? '' : ','}\n    ${providerEntry},\n  `
        : `\n    ${providerEntry},\n  `;

      next = next.replace(providersArrayRegex, `providers: [${normalized}]`);
    }
  } else {
    const moduleDecoratorRegex = /@Module\(\{([\s\S]*?)\}\)/m;
    const moduleMatch = next.match(moduleDecoratorRegex);

    if (moduleMatch === null) {
      throw new Error(`Could not find @Module decorator in ${modulePath}`);
    }

    const body = moduleMatch[1];
    const bodyTrimmedEnd = body.trimEnd();
    const hasContent = bodyTrimmedEnd.trim().length > 0;
    const suffix = hasContent
      ? `${bodyTrimmedEnd}${bodyTrimmedEnd.trim().endsWith(',') ? '' : ','}\n  `
      : '\n  ';
    const replaced = `${suffix}providers: [\n    ${providerEntry},\n  ],\n`;

    next = next.replace(moduleDecoratorRegex, `@Module({${replaced}})`);
  }

  if (next !== source) {
    writeFileSync(modulePath, next);
    if (!createdFiles.includes(modulePath)) {
      createdFiles.push(modulePath);
    }
    console.log(`updated ${modulePath}`);
  }
};

const ensureRepositoryRegisteredToDomainModule = (
  dir: string,
  domain: string,
) => {
  const modulePath = path.resolve(
    process.cwd(),
    'src',
    'modules',
    dir,
    `${dir}.module.ts`,
  );

  const repositoryClass = `${pascalCase(domain)}Repository`;
  const repositoryToken = `${snakeCase(domain).toUpperCase()}_REPOSITORY`;
  const importLines = [
    `import { ${repositoryClass} } from '@module/${dir}/repositories/${domain}.repository';`,
    `import { ${repositoryToken} } from '@module/${dir}/repositories/${domain}.repository.interface';`,
  ];

  upsertProviderToModule(
    modulePath,
    importLines,
    repositoryToken,
    repositoryClass,
  );
};

const ensureDomainModuleRegisteredToApp = (dir: string) => {
  const appModulePath = path.resolve(process.cwd(), 'src', 'app.module.ts');
  if (!existsSync(appModulePath)) {
    throw new Error(`app.module.ts not found at ${appModulePath}`);
  }

  const domainClass = `${pascalCase(dir)}Module`;
  const importLine = `import { ${domainClass} } from '@module/${dir}/${dir}.module';`;

  const source = readFileSync(appModulePath, 'utf8');

  let next = source;

  if (!next.includes(importLine)) {
    next = `${importLine}\n${next}`;
  }

  const importsArrayRegex = /imports:\s*\[([\s\S]*?)\]/m;
  const match = next.match(importsArrayRegex);

  if (match === null) {
    throw new Error('Could not find imports array in app.module.ts');
  }

  const currentItemsText = match[1];
  if (!currentItemsText.includes(domainClass)) {
    const trimmed = currentItemsText.trimEnd();
    const hasItems = trimmed.trim().length > 0;
    const normalized = hasItems
      ? `${trimmed}${trimmed.trim().endsWith(',') ? '' : ','}\n    ${domainClass},\n  `
      : `\n    ${domainClass},\n  `;

    next = next.replace(importsArrayRegex, `imports: [${normalized}]`);
  }

  if (next !== source) {
    writeFileSync(appModulePath, next);
    if (!createdFiles.includes(appModulePath)) {
      createdFiles.push(appModulePath);
    }
    console.log(`updated ${appModulePath}`);
  }
};

const generateAssembler = (rootDir: string, dir: string, domain: string) => {
  const PRESET = `
import { DomainNameDto } from '@module/dir-name/dto/domain-name.dto';
import { DomainName } from '@module/dir-name/domain/domain-name.entity';

export class DomainNameDtoAssembler {
  static convertToDto(domainName: DomainName): DomainNameDto {
    const dto = new DomainNameDto({
      id: domainName.id,
      createdAt: domainName.createdAt,
      updatedAt: domainName.updatedAt,
    });

    return dto;
  }
}
`;

  writeFileIfAbsent(
    `${rootDir}/assemblers/${domain}-dto.assembler.ts`,
    PRESET,
    dir,
    domain,
  );
};

const generateDto = (rootDir: string, dir: string, domain: string) => {
  const PRESET = `
import { BaseResponseDto } from '@common/base/base.dto';

export class DomainNameDto extends BaseResponseDto {}
`;

  writeFileIfAbsent(`${rootDir}/dto/${domain}.dto.ts`, PRESET, dir, domain);
};

const generateEntity = (rootDir: string, dir: string, domain: string) => {
  const ENTITY_PRESET = `
import {
  BaseEntity,
  CreateEntityProps,
  generateEntityId,
} from '@common/base/base.entity';

export interface DomainNameProps {}

interface CreateDomainNameProps {}

export class DomainName extends BaseEntity<DomainNameProps> {
  constructor(props: CreateEntityProps<DomainNameProps>) {
    super(props);
  }

  static create(props: CreateDomainNameProps) {
    void props;

    const id = generateEntityId();
    const date = new Date();

    return new DomainName({
      id,
      props: {},
      createdAt: date,
      updatedAt: date,
    });
  }

  public validate(): void {}
}
`;

  const FACTORY_PRESET = `
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import {
  DomainName,
  DomainNameProps,
} from '@module/dir-name/domain/domain-name.entity';

import { BaseEntityProps, generateEntityId } from '@common/base/base.entity';

type DomainNameFactoryAttributes = DomainNameProps & BaseEntityProps;

export const DomainNameFactory = Factory.define<
  DomainName,
  void,
  DomainName,
  Partial<DomainNameFactoryAttributes>
>(({ params }) => {
  const defaultAttributes: DomainNameFactoryAttributes = {
    id: generateEntityId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const attributes = Object.assign(defaultAttributes, params);

  const { id, createdAt, updatedAt, ...props } = attributes;

  return new DomainName({ id, createdAt, updatedAt, props });
});
`;

  writeFileIfAbsent(
    `${rootDir}/domain/${domain}.entity.ts`,
    ENTITY_PRESET,
    dir,
    domain,
  );

  writeFileIfAbsent(
    `${rootDir}/domain/__spec__/${domain}.entity.factory.ts`,
    FACTORY_PRESET,
    dir,
    domain,
  );
};

const generateMapper = (rootDir: string, dir: string, domain: string) => {
  const PRESET = `
import { DomainName } from '@module/dir-name/domain/domain-name.entity';

import { BaseMapper } from '@common/base/base.mapper';

export interface DomainNameRaw {
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
}

export class DomainNameMapper extends BaseMapper {
  static toEntity(raw: DomainNameRaw): DomainName {
    return new DomainName({
      id: this.toEntityId(raw.id),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      props: {},
    });
  }

  static toPersistence(entity: DomainName): DomainNameRaw {
    return {
      id: this.toPrimaryKey(entity.id),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
`;

  writeFileIfAbsent(
    `${rootDir}/mappers/${domain}.mapper.ts`,
    PRESET,
    dir,
    domain,
  );
};

const generateRepository = (rootDir: string, dir: string, domain: string) => {
  const INTERFACE_PRESET = `
import { DomainName } from '@module/dir-name/domain/domain-name.entity';

import { RepositoryPort } from '@common/base/base.repository';

export const DOMAIN_NAME_REPOSITORY = Symbol('DOMAIN_NAME_REPOSITORY');

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDomainNameRepository extends RepositoryPort<DomainName> {}
`;

  const REPOSITORY_PRESET = `
import { Injectable } from '@nestjs/common';

import {
  InjectTransactionHost,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { DomainName } from '@module/dir-name/domain/domain-name.entity';
import { DomainNameMapper } from '@module/dir-name/mappers/domain-name.mapper';
import { IDomainNameRepository } from '@module/dir-name/repositories/domain-name.repository.interface';

import { EntityId } from '@common/base/base.entity';
import { BaseRepository } from '@common/base/base.repository';

import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class DomainNameRepository
  extends BaseRepository<DomainName>
  implements IDomainNameRepository
{
  protected TABLE_NAME: string;

  constructor(
    @InjectTransactionHost()
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {
    super();
  }

  async insert(entity: DomainName): Promise<DomainName> {
    const raw = DomainNameMapper.toPersistence(entity);

    await this.txHost.tx.domainName.create({
      data: raw,
    });

      return entity;
  }

  async findOneById(id: EntityId): Promise<DomainName | undefined> {
    if (isNaN(Number(id))) {
      return;
    }

    const raw = await this.txHost.tx.domainName.findUnique({
      where: {
        id: DomainNameMapper.toPrimaryKey(id),
      },
    });

    if (raw === null) {
      return;
    }

    return DomainNameMapper.toEntity(raw);
  }

  async update(entity: DomainName): Promise<DomainName> {
    const raw = DomainNameMapper.toPersistence(entity);

    await this.txHost.tx.domainName.update({
      where: {
        id: raw.id,
      },
      data: raw,
    });

    return DomainNameMapper.toEntity(raw);
  }

  async delete(entity: DomainName): Promise<void> {
    await this.txHost.tx.domainName.delete({
      where: {
        id: DomainNameMapper.toPrimaryKey(entity.id),
      },
    });
  }
}
`;

  const SPEC_PRESET = `
import { Test, TestingModule } from '@nestjs/testing';

import { DomainNameFactory } from '@module/dir-name/domain/__spec__/domain-name.entity.factory';
import { DomainName } from '@module/dir-name/domain/domain-name.entity';
import { DomainNameRepository } from '@module/dir-name/repositories/domain-name.repository';
import {
  DOMAIN_NAME_REPOSITORY,
  IDomainNameRepository,
} from '@module/dir-name/repositories/domain-name.repository.interface';

import { generateEntityId } from '@common/base/base.entity';
import { ClsModuleFactory } from '@common/factories/cls-module.factory';

describe(DomainNameRepository.name, () => {
  let repository: IDomainNameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModuleFactory()],
      providers: [
        {
          provide: DOMAIN_NAME_REPOSITORY,
          useClass: DomainNameRepository,
        },
      ],
    }).compile();

    repository = module.get<IDomainNameRepository>(DOMAIN_NAME_REPOSITORY);
  });

  describe(DomainNameRepository.prototype.insert.name, () => {
    let domainName: DomainName;

    beforeEach(() => {
      domainName = DomainNameFactory.build();
    });

    it('리소스를 생성해야한다.', async () => {
      await expect(repository.insert(domainName)).resolves.toEqual(domainName);
      await expect(repository.findOneById(domainName.id)).resolves.toEqual(
        domainName,
      );
    });
  });

  describe(DomainNameRepository.prototype.findOneById.name, () => {
    let domainName: DomainName;

    beforeEach(async () => {
      domainName = await repository.insert(DomainNameFactory.build());
    });

    describe('식별자에 해당하는 리소스가 존재하는 경우', () => {
      it('리소스를 반환해야한다.', async () => {
        await expect(repository.findOneById(domainName.id)).resolves.toEqual(
          domainName,
        );
      });
    });

    describe('식별자에 해당하는 리소스가 존재하지 않는 경우', () => {
      it('undefined를 반환해야한다.', async () => {
        await expect(
          repository.findOneById(generateEntityId()),
        ).resolves.toBeUndefined();
      });
    });
  });

  describe(DomainNameRepository.prototype.update.name, () => {
    let domainName: DomainName;

    beforeEach(async () => {
      domainName = await repository.insert(DomainNameFactory.build());
    });

    it('리소스를 수정해야한다.', async () => {
      const newDomainName = DomainNameFactory.build({
        id: domainName.id,
      });

      await expect(repository.update(newDomainName)).resolves.toEqual(
        newDomainName,
      );
      await expect(repository.findOneById(domainName.id)).resolves.toEqual(
        newDomainName,
      );
    });
  });

  describe(DomainNameRepository.prototype.delete.name, () => {
    let domainName: DomainName;

    beforeEach(async () => {
      domainName = await repository.insert(DomainNameFactory.build());
    });

    it('리소스를 삭제해야한다.', async () => {
      await expect(repository.delete(domainName)).resolves.toBeUndefined();
      await expect(repository.findOneById(domainName.id)).resolves.toBeUndefined();
    });
  });
});
`;

  writeFileIfAbsent(
    `${rootDir}/repositories/${domain}.repository.interface.ts`,
    INTERFACE_PRESET,
    dir,
    domain,
  );
  writeFileIfAbsent(
    `${rootDir}/repositories/${domain}.repository.ts`,
    REPOSITORY_PRESET,
    dir,
    domain,
  );
  writeFileIfAbsent(
    `${rootDir}/repositories/__spec__/${domain}.repository.spec.ts`,
    SPEC_PRESET,
    dir,
    domain,
  );
};

program
  .name('generate-domain')
  .description('Generate a new general file for domain.')
  .version('1.0.0')
  .action(async () => {
    const rl = createInterface({ input, output });
    const dirName = (await rl.question('module(dir) name: ')).trim();
    const domainName = (await rl.question('domain name: ')).trim();
    rl.close();

    if (domainName.length === 0 || dirName.length === 0) {
      throw new Error('domainName, dirName must not be empty');
    }

    const rootDir = path.resolve(process.cwd(), 'src', 'modules', dirName);

    generateDirs(rootDir);
    generateAssembler(rootDir, dirName, domainName);
    generateDto(rootDir, dirName, domainName);
    generateEntity(rootDir, dirName, domainName);
    generateMapper(rootDir, dirName, domainName);
    generateRepository(rootDir, dirName, domainName);

    const moduleState = ensureDomainModule(dirName);
    ensureRepositoryRegisteredToDomainModule(dirName, domainName);
    if (moduleState.created) {
      ensureDomainModuleRegisteredToApp(dirName);
    }

    if (createdFiles.length > 0) {
      await runCommand(`npx prettier --write ${createdFiles.join(' ')}`);
    }
  });

program.parse(process.argv);
