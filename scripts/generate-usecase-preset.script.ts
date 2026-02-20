/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { exec } from 'child_process';
import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { stdin as input, stdout as output } from 'process';
import { createInterface } from 'readline/promises';
import camelCase from 'to-camel-case';
import pascalCase from 'to-pascal-case';
import snakeCase from 'to-snake-case';

const program = new Command();

const createdFiles: string[] = [];

const upperSnake = (value: string) => String(snakeCase(value)).toUpperCase();

const promptOperationSelect = async (): Promise<'query' | 'command'> => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('TTY environment is required for interactive selection');
  }

  const options = ['query', 'command'] as const;
  let selectedIndex = 0;
  let renderedLines = 0;

  const clearRendered = () => {
    for (let i = 0; i < renderedLines; i += 1) {
      output.write('\x1b[2K');
      output.write('\x1b[1A');
    }
    if (renderedLines > 0) {
      output.write('\x1b[2K');
    }
  };

  const render = () => {
    clearRendered();
    output.write('operation 선택 (↑/↓, Enter):\n');
    output.write(
      `${selectedIndex === 0 ? '>' : ' '} query\n${selectedIndex === 1 ? '>' : ' '} command\n`,
    );
    renderedLines = 3;
  };

  render();

  return new Promise((resolve) => {
    const cleanup = () => {
      input.off('data', onData);
      if (input.isTTY) {
        input.setRawMode(false);
      }
      input.pause();
    };

    const onData = (chunk: Buffer) => {
      const key = chunk.toString('utf8');

      if (key === '\u0003') {
        cleanup();
        clearRendered();
        output.write('\n');
        process.exit(1);
      }

      if (key === '\r' || key === '\n') {
        cleanup();
        clearRendered();
        output.write(`operation: ${options[selectedIndex]}\n`);
        resolve(options[selectedIndex]);
        return;
      }

      if (key === '\u001b[A') {
        selectedIndex =
          selectedIndex === 0 ? options.length - 1 : selectedIndex - 1;
        render();
        return;
      }

      if (key === '\u001b[B') {
        selectedIndex = (selectedIndex + 1) % options.length;
        render();
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on('data', onData);
  });
};

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

const toReconfiguredText = (
  preset: string,
  moduleName: string,
  domainName: string,
  useCaseName: string,
  operation: 'command' | 'query',
) => {
  const REGEXP_MAP = [
    ['module-name', moduleName],
    ['domain-name', domainName],
    ['DomainName', pascalCase(domainName)],
    ['domainName', camelCase(domainName)],
    ['DOMAIN_NAME', upperSnake(domainName)],

    ['use-case-name', useCaseName],
    ['UseCaseName', pascalCase(useCaseName)],
    ['useCaseName', camelCase(useCaseName)],
    ['USE_CASE_NAME', upperSnake(useCaseName)],

    ['operation-name', operation],
    ['OperationName', pascalCase(operation)],
    ['operationName', operation],
  ] as const;

  return REGEXP_MAP.reduce((acc, [key, value]) => {
    const regexp = new RegExp(key, 'gm');
    return acc.replace(regexp, value);
  }, preset);
};

const writeFileIfAbsent = (
  filePath: string,
  preset: string,
  moduleName: string,
  domainName: string,
  useCaseName: string,
  operation: 'command' | 'query',
) => {
  if (existsSync(filePath)) {
    console.log(`already exist file ${filePath}`);
    return;
  }

  writeFileSync(
    filePath,
    toReconfiguredText(preset, moduleName, domainName, useCaseName, operation),
  );
  createdFiles.push(filePath);
  console.log(`generate file ${filePath}`);
};

const ensureDir = (dirPath: string) => {
  mkdirSync(dirPath, { recursive: true });
  console.log(`ensure dir ${dirPath}`);
};

const upsertModuleImport = (
  modulePath: string,
  importLine: string,
  moduleClassName: string,
) => {
  const source = readFileSync(modulePath, 'utf8');

  let next = source;

  if (!next.includes(importLine)) {
    next = `${importLine}\n${next}`;
  }

  const importsArrayRegex = /imports:\s*\[([\s\S]*?)\]/m;
  const match = next.match(importsArrayRegex);

  if (match === null) {
    throw new Error(`Could not find imports array in ${modulePath}`);
  }

  const currentItemsText = match[1];
  if (!currentItemsText.includes(moduleClassName)) {
    const trimmed = currentItemsText.trimEnd();
    const hasItems = trimmed.trim().length > 0;

    const normalized = hasItems
      ? `${trimmed}${trimmed.trim().endsWith(',') ? '' : ','}\n    ${moduleClassName},\n  `
      : `\n    ${moduleClassName},\n  `;

    next = next.replace(importsArrayRegex, `imports: [${normalized}]`);
  }

  if (next !== source) {
    writeFileSync(modulePath, next);
    if (!createdFiles.includes(modulePath)) {
      createdFiles.push(modulePath);
    }
    console.log(`updated ${modulePath}`);
  }
};

const ensureDomainModule = (moduleName: string) => {
  const modulePath = path.resolve(
    process.cwd(),
    'src',
    'modules',
    moduleName,
    `${moduleName}.module.ts`,
  );

  const PRESET = `
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class UseCaseNameModule {}
`;

  const existed = existsSync(modulePath);
  writeFileIfAbsent(
    modulePath,
    PRESET,
    moduleName,
    moduleName,
    moduleName,
    'command',
  );

  return {
    modulePath,
    created: !existed,
  };
};

const upsertArrayItemToModule = (
  modulePath: string,
  importLine: string,
  arrayName: 'controllers' | 'providers',
  itemName: string,
) => {
  const source = readFileSync(modulePath, 'utf8');
  let next = source;

  if (!next.includes(importLine)) {
    next = `${importLine}\n${next}`;
  }

  const arrayRegex = new RegExp(`${arrayName}:\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const match = next.match(arrayRegex);

  if (match !== null) {
    const currentItemsText = match[1];
    if (!currentItemsText.includes(itemName)) {
      const trimmed = currentItemsText.trimEnd();
      const hasItems = trimmed.trim().length > 0;
      const normalized = hasItems
        ? `${trimmed}${trimmed.trim().endsWith(',') ? '' : ','}\n    ${itemName},\n  `
        : `\n    ${itemName},\n  `;

      next = next.replace(arrayRegex, `${arrayName}: [${normalized}]`);
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
    const replaced = `${suffix}${arrayName}: [\n    ${itemName},\n  ],\n`;

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

const ensureDomainModuleRegisteredToApp = (moduleName: string) => {
  const appModulePath = path.resolve(process.cwd(), 'src', 'app.module.ts');
  if (!existsSync(appModulePath)) {
    throw new Error(`app.module.ts not found at ${appModulePath}`);
  }

  const domainClass = `${pascalCase(moduleName)}Module`;
  const importLine = `import { ${domainClass} } from '@module/${moduleName}/${moduleName}.module';`;

  upsertModuleImport(appModulePath, importLine, domainClass);
};

const ensureUseCaseRegisteredToDomainModule = (
  moduleName: string,
  useCaseName: string,
) => {
  const domainModulePath = path.resolve(
    process.cwd(),
    'src',
    'modules',
    moduleName,
    `${moduleName}.module.ts`,
  );

  const useCaseControllerClass = `${pascalCase(useCaseName)}Controller`;
  const useCaseHandlerClass = `${pascalCase(useCaseName)}Handler`;
  const controllerImport = `import { ${useCaseControllerClass} } from '@module/${moduleName}/use-cases/${useCaseName}/${useCaseName}.controller';`;
  const handlerImport = `import { ${useCaseHandlerClass} } from '@module/${moduleName}/use-cases/${useCaseName}/${useCaseName}.handler';`;

  upsertArrayItemToModule(
    domainModulePath,
    controllerImport,
    'controllers',
    useCaseControllerClass,
  );
  upsertArrayItemToModule(
    domainModulePath,
    handlerImport,
    'providers',
    useCaseHandlerClass,
  );
};

const PRESETS = {
  CONTROLLER_COMMAND_PRESET: `import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DomainNameDtoAssembler } from '@module/module-name/assemblers/domain-name-dto.assembler';
import { DomainName } from '@module/module-name/domain/domain-name.entity';
import { DomainNameDto } from '@module/module-name/dto/domain-name.dto';
import { UseCaseNameDto } from '@module/module-name/use-cases/use-case-name/use-case-name.dto';
import { UseCaseNameOperationName } from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

import { RequestValidationError } from '@common/base/base.error';
import { ApiErrorResponse } from '@common/decorators/api-fail-response.decorator';

@ApiTags('module-name')
@Controller()
export class UseCaseNameController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: '' })
  @ApiOkResponse({ type: DomainNameDto })
  @ApiErrorResponse({
    [HttpStatus.BAD_REQUEST]: [RequestValidationError],
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async useCaseName(@Body() dto: UseCaseNameDto): Promise<DomainNameDto> {
    try {
      const domainName = await this.commandBus.execute<
        UseCaseNameOperationName,
        DomainName
      >(
        new UseCaseNameOperationName(dto),
      );

      return DomainNameDtoAssembler.convertToDto(domainName);
    } catch (error) {
      throw error;
    }
  }
}
`,

  CONTROLLER_QUERY_PRESET: `import { Controller, Get, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DomainNameDtoAssembler } from '@module/module-name/assemblers/domain-name-dto.assembler';
import { DomainName } from '@module/module-name/domain/domain-name.entity';
import { DomainNameDto } from '@module/module-name/dto/domain-name.dto';
import { UseCaseNameOperationName } from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

import { RequestValidationError } from '@common/base/base.error';
import { ApiErrorResponse } from '@common/decorators/api-fail-response.decorator';

@ApiTags('module-name')
@Controller()
export class UseCaseNameController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: '' })
  @ApiOkResponse({ type: DomainNameDto })
  @ApiErrorResponse({
    [HttpStatus.BAD_REQUEST]: [RequestValidationError],
  })
  @Get()
  async useCaseName(): Promise<DomainNameDto> {
    try {
      const domainName = await this.queryBus.execute<
        UseCaseNameOperationName,
        DomainName
      >(
        new UseCaseNameOperationName({}),
      );

      return DomainNameDtoAssembler.convertToDto(domainName);
    } catch (error) {
      throw error;
    }
  }
}
`,

  HANDLER_COMMAND_PRESET: `import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { DomainName } from '@module/module-name/domain/domain-name.entity';
import {
  DOMAIN_NAME_REPOSITORY,
  IDomainNameRepository,
} from '@module/module-name/repositories/domain-name.repository.interface';
import { UseCaseNameOperationName } from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

@CommandHandler(UseCaseNameOperationName)
export class UseCaseNameHandler
  implements ICommandHandler<UseCaseNameOperationName, DomainName>
{
  constructor(
    @Inject(DOMAIN_NAME_REPOSITORY)
    private readonly domainNameRepository: IDomainNameRepository,
  ) {}

  async execute(command: UseCaseNameOperationName): Promise<DomainName> {
    void command;
  }
}
`,

  HANDLER_QUERY_PRESET: `import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { DomainName } from '@module/module-name/domain/domain-name.entity';
import {
  DOMAIN_NAME_REPOSITORY,
  IDomainNameRepository,
} from '@module/module-name/repositories/domain-name.repository.interface';
import { UseCaseNameOperationName } from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

@QueryHandler(UseCaseNameOperationName)
export class UseCaseNameHandler
  implements IQueryHandler<UseCaseNameOperationName, DomainName>
{
  constructor(
    @Inject(DOMAIN_NAME_REPOSITORY)
    private readonly domainNameRepository: IDomainNameRepository,
  ) {}

  async execute(query: UseCaseNameOperationName): Promise<DomainName> {
    void query;
  }
}
`,

  HANDLER_SPEC_PRESET: `import { Test, TestingModule } from '@nestjs/testing';

import {
  DOMAIN_NAME_REPOSITORY,
  IDomainNameRepository,
} from '@module/module-name/repositories/domain-name.repository.interface';
import { UseCaseNameOperationNameFactory } from '@module/module-name/use-cases/use-case-name/__spec__/use-case-name-operation-name.factory';
import { UseCaseNameHandler } from '@module/module-name/use-cases/use-case-name/use-case-name.handler';
import { UseCaseNameOperationName } from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

describe(UseCaseNameHandler.name, () => {
  let handler: UseCaseNameHandler;
  let domainNameRepository: IDomainNameRepository;

  let operationName: UseCaseNameOperationName;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UseCaseNameHandler,
        {
          provide: DOMAIN_NAME_REPOSITORY,
          useValue: {},
        },
      ],
    }).compile();

    handler = module.get<UseCaseNameHandler>(UseCaseNameHandler);
    domainNameRepository = module.get<IDomainNameRepository>(
      DOMAIN_NAME_REPOSITORY,
    );
  });

  beforeEach(() => {
    operationName = UseCaseNameOperationNameFactory.build();
  });

  it('핸들러가 정의되어야한다.', async () => {
    await expect(handler.execute(operationName)).resolves.toBeDefined();
  });
});
`,

  OPERATION_COMMAND_PRESET: `import { BaseCommand } from '@common/base/base.command';

export interface IUseCaseNameOperationNameProps {}

export class UseCaseNameOperationName extends BaseCommand {
  constructor(props: IUseCaseNameOperationNameProps) {
    super();
    void props;
  }
}
`,

  OPERATION_QUERY_PRESET: `import { BaseQuery } from '@common/base/base.query';

export interface IUseCaseNameOperationNameProps {}

export class UseCaseNameOperationName extends BaseQuery {
  constructor(props: IUseCaseNameOperationNameProps) {
    super();
    void props;
  }
}
`,

  FACTORY_OPERATION_PRESET: `import { Factory } from 'fishery';

import {
  IUseCaseNameOperationNameProps,
  UseCaseNameOperationName,
} from '@module/module-name/use-cases/use-case-name/use-case-name.operation-name';

export const UseCaseNameOperationNameFactory = Factory.define<
  UseCaseNameOperationName,
  void,
  UseCaseNameOperationName,
  Partial<IUseCaseNameOperationNameProps>
>(({ params }) => {
  const defaultAttributes: IUseCaseNameOperationNameProps = {};
  const attributes = Object.assign(defaultAttributes, params);

  return new UseCaseNameOperationName(attributes);
});
`,

  DTO_PRESET: `export class UseCaseNameDto {}
`,
};

program
  .name('generate-usecase')
  .description('Generate a new use case preset.')
  .version('1.0.0')
  .action(async () => {
    const rl = createInterface({ input, output });
    const moduleName = (await rl.question('module name: ')).trim();
    const domainName = (await rl.question('domain name: ')).trim();
    const useCaseName = (await rl.question('use-case name: ')).trim();
    rl.close();

    const operation = await promptOperationSelect();

    if (
      moduleName.length === 0 ||
      domainName.length === 0 ||
      useCaseName.length === 0
    ) {
      throw new Error('moduleName, domainName, useCaseName is required');
    }

    const useCaseDir = path.resolve(
      process.cwd(),
      'src',
      'modules',
      moduleName,
      'use-cases',
      useCaseName,
    );

    ensureDir(useCaseDir);
    ensureDir(path.join(useCaseDir, '__spec__'));

    const domainModuleState = ensureDomainModule(moduleName);
    if (domainModuleState.created) {
      ensureDomainModuleRegisteredToApp(moduleName);
    }

    const controllerPath = `${useCaseDir}/${useCaseName}.controller.ts`;
    const operationPath = `${useCaseDir}/${useCaseName}.${operation}.ts`;
    const handlerPath = `${useCaseDir}/${useCaseName}.handler.ts`;
    const handlerSpecPath = `${useCaseDir}/__spec__/${useCaseName}.handler.spec.ts`;
    const factoryPath = `${useCaseDir}/__spec__/${useCaseName}-${operation}.factory.ts`;
    const dtoPath = `${useCaseDir}/${useCaseName}.dto.ts`;

    writeFileIfAbsent(
      controllerPath,
      operation === 'command'
        ? PRESETS.CONTROLLER_COMMAND_PRESET
        : PRESETS.CONTROLLER_QUERY_PRESET,
      moduleName,
      domainName,
      useCaseName,
      operation,
    );
    writeFileIfAbsent(
      handlerPath,
      operation === 'command'
        ? PRESETS.HANDLER_COMMAND_PRESET
        : PRESETS.HANDLER_QUERY_PRESET,
      moduleName,
      domainName,
      useCaseName,
      operation,
    );
    writeFileIfAbsent(
      operationPath,
      operation === 'command'
        ? PRESETS.OPERATION_COMMAND_PRESET
        : PRESETS.OPERATION_QUERY_PRESET,
      moduleName,
      domainName,
      useCaseName,
      operation,
    );
    writeFileIfAbsent(
      handlerSpecPath,
      PRESETS.HANDLER_SPEC_PRESET,
      moduleName,
      domainName,
      useCaseName,
      operation,
    );
    writeFileIfAbsent(
      factoryPath,
      PRESETS.FACTORY_OPERATION_PRESET,
      moduleName,
      domainName,
      useCaseName,
      operation,
    );

    if (operation === 'command') {
      writeFileIfAbsent(
        dtoPath,
        PRESETS.DTO_PRESET,
        moduleName,
        domainName,
        useCaseName,
        operation,
      );
    }

    ensureUseCaseRegisteredToDomainModule(moduleName, useCaseName);

    if (createdFiles.length > 0) {
      await runCommand(`npx prettier --write ${createdFiles.join(' ')}`);
    }

    console.log(`Use case '${useCaseName}' generated successfully.`);
  });

program.parse(process.argv);
