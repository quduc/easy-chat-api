import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ApiOK } from '../../common/responses/api-response';
import { ChatService } from './chat.service';
import { GetMessageDto, GetMessageHistoryDto, MessageDto } from './dto/request.dto';

@Auth()
@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('send')
  @ApiOperation({ summary: 'Send message. Socket event: sendMessage' })
  async sendMessage(@CurrentUser() user, @Body() data: MessageDto) {
    const result = await this.chatService.sendMessage(user.id, data)
    return result
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history. Socket event: getHistoryChat' })
  async getMessageHistory(@CurrentUser() user, @Query() data: GetMessageHistoryDto) {
    const result = await this.chatService.getHistory(user.id, data)
    return result
  }

  @Get('message')
  @ApiOperation({ summary: 'Get chat history. Socket event: getHistoryChat' })
  async getMessage(@CurrentUser() user, @Query() data: GetMessageDto) {
    const result = await this.chatService.getMessage(user.id, data)
    return result
  }
}