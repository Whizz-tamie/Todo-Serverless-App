import 'source-map-support/register'

import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

//dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosByUserIndex = process.env.TODOS_BY_USER_INDEX
    ) {}
  
    async todoItemExists(userId: string, todoId: string): Promise<boolean> {
      const item = await this.getTodoItem(userId, todoId)
      return !!item
    }
  
    async getTodoItems(userId: string): Promise<TodoItem[]> {
      logger.info(`Getting all todos for user ${userId} from ${this.todosTable}`)
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosByUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
  
      const items = result.Items
  
      logger.info(`Found ${items.length} todos for user ${userId} in ${this.todosTable}`)
  
      return items as TodoItem[]
    }
  
    async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
      logger.info(`Getting todo ${todoId} from ${this.todosTable}`)
  
      const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }).promise()
  
      const item = result.Item
  
      return item as TodoItem
    }
  
    async createTodoItem(todoItem: TodoItem) {
      logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)
  
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem,
      }).promise()
    }
  
    async updateTodoItem(todoId: string, todoUpdate: TodoUpdate, userId: string) {
      logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": todoUpdate.name,
          ":dueDate": todoUpdate.dueDate,
          ":done": todoUpdate.done
        }
      }).promise()   
    }
  
    async deleteTodoItem(todoId: string, userId: string) {
      logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)
  
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }).promise()    
    }
  
    async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
      logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)
  
      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      }).promise()
    }
  
  }