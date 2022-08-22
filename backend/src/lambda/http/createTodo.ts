import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing createTodo event', { event })

    //creating a new TODO item
    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const newItem = await createTodo(userId, newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  }
)
handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true,
    header: "*"
  })
)
