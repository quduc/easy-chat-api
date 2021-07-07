import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiOK } from '../../common/responses/api-response';
import { Auth } from '../../common/decorators/auth.decorator';

@Auth()
@Controller('invitation')
@ApiTags('Invitation')
export class InvitationController {

}
