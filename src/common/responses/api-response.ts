

export class ApiOK {
  meta: {
    code: number,
    msg?: string
  }
  data: any

  constructor(data?: any) {
    this.meta = {
      code: 0
    }
    this.data = data
  }
}
