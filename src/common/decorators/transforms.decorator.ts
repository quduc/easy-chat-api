import { Transform } from "class-transformer";

export function RemoveSpace() {
  return Transform(value => {
    let rValue = value.value.split(' ').join('')
    return rValue
  })
}

export function TrimStr() {
  return Transform(value => {
    let rValue = value.value.trim()
    return rValue
  })
}