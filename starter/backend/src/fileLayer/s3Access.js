import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createLogger } from '../utils/logger.mjs'

const TODOS_BUCKET = process.env.TODOS_BUCKET
const SIGNED_URL_EXPIRATION = parseInt(process.env.SIGNED_URL_EXPIRATION)
const logger = createLogger("s3Access");

export class S3Access {
    constructor(
        s3Client = new S3Client(),
        bucketName = TODOS_BUCKET,
        urlExpiration = SIGNED_URL_EXPIRATION
    ){
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.urlExpiration = urlExpiration;
    }

    async getUploadUrl (key) {
        logger.info({
            "action": `Getting signed url`
        });

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: this.urlExpiration
        })
        return url;
    }
}