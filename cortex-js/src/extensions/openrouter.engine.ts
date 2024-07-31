import stream from 'stream';
import { HttpService } from '@nestjs/axios';
import { OAIEngineExtension } from '../domain/abstracts/oai.abstract';
import { ConfigsUsecases } from '@/usecases/configs/configs.usecase';
import { EventEmitter2 } from '@nestjs/event-emitter';
import _ from 'lodash';
import { EngineStatus } from '@/domain/abstracts/engine.abstract';

/**
 * A class that implements the InferenceExtension interface from the @janhq/core package.
 * The class provides methods for initializing and stopping a model, and for making inference requests.
 * It also subscribes to events emitted by the @janhq/core package and handles new message requests.
 */
export default class OpenRouterEngineExtension extends OAIEngineExtension {
  apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  name = 'openrouter';
  productName = 'OpenRouter Inference Engine';
  description = 'This extension enables OpenRouter chat completion API calls';
  version = '0.0.1';
  apiKey?: string;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly configsUsecases: ConfigsUsecases,
    protected readonly eventEmmitter: EventEmitter2,
  ) {
    super(httpService);

    eventEmmitter.on('config.updated', async (data) => {
      if (data.engine === this.name) {
        this.apiKey = data.value;
        this.status =
          (this.apiKey?.length ?? 0) > 0
            ? EngineStatus.READY
            : EngineStatus.MISSING_CONFIGURATION;
      }
    });
  }

  async onLoad() {
    const configs = (await this.configsUsecases.getGroupConfigs(
      this.name,
    )) as unknown as { apiKey: string };
    this.apiKey = configs?.apiKey;
    this.status =
      (this.apiKey?.length ?? 0) > 0
        ? EngineStatus.READY
        : EngineStatus.MISSING_CONFIGURATION;
  }

  transformPayload = (data: any): any => {
    return {
      ...data,
      model: 'openrouter/auto',
    };
  };
}
