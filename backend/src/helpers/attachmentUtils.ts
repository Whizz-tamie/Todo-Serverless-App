import 'source-map-support/register'

import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

//fileStogare logic
export class AttachmentUtils {

    constructor(
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) {}
  
    async getAttachmentUrl(todoId: string): Promise<string> {
      const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
      return attachmentUrl
  }   

    async getUploadUrl(todoId: string): Promise<string> {
      const uploadUrl = this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: this.urlExpiration
      })
      return uploadUrl
    }
  
  }