import { message_id, MessageID } from './messageID'
import { method } from './method'
import { parameters } from './message'
import { JSONValue } from '../json'
import * as Joi from 'joi'

// every request sent must be replied to with a response.
export type request = {
  id: message_id,
  method: method,
  params: parameters
}

export class Request {

  public static schema = Joi.object({
    id: MessageID.schema,
    method: Joi.string().required(),
    params: Joi.array().required()
  })

  static valid(message: request): boolean {
    if (Request.schema.validate(message).error) return false

    for (let x of message.params) if (x === undefined) return false

    return true
  }

  static read(message: JSONValue): request | undefined {
    if (Request.valid(<request>message)) return <request>message
  }

  static id(message: request): message_id {
    if (Request.valid(message)) return message['id']

    throw "invalid request"
  }

  static method(message: request): method {
    if (Request.valid(message)) return message['method']

    throw "invalid request"
  }

  static params(message: request): parameters {
    if (Request.valid(message)) return message['params']

    throw "invalid request"
  }
}
