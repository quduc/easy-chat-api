import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from "@nestjs/common";
import * as _ from 'lodash'

export function customValidationPipe(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
      const extraInfo = _.reduce(errors, (data, item) => {
        let values = Object.values(item.constraints)
        let tmp = { field: item.property, value: values[values.length - 1] }
        data.push(tmp)
        return data
      }, [])
      const code = extraInfo[0].value
      delete (extraInfo[0].value)
      const response = {
        errorCode: code,
        // msg: 'Invalid params',
        extraInfo: extraInfo[0],
        code: -1
      }
      return new BadRequestException(response, 'Invalid params')
    },
    transform: true,
  }));
}