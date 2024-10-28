import { HttpService } from '@nestjs/axios';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Controller('api/predict')
export class PredictController {
  constructor(
    private config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  async predictCategory(@Body('search_query') searchQuery: string) {
    const response = await lastValueFrom(
      this.httpService.post(
        `http://${this.config.get('PREDICTION_SERVICE_HOST')}:${this.config.get('PREDICTION_SERVICE_PORT')}/predict`,
        {
          search_query: searchQuery,
        },
      ),
    );
    return response.data;
  }
}
