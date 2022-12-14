import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
//import * as uuid from 'uuid'
import { createUrl, updateAttachmentUrl} from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl event', { event })

    //Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    const uploadUrl = await createUrl(todoId)

    await updateAttachmentUrl(userId, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
  }
}
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      header: "*",
      origin: "*"
    })
  )
