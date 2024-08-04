import { decode } from 'jsonwebtoken'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('utils')
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken) {
    const token = getToken(jwtToken)
    const decodedJwt = decode(token)
    
    logger.info('User was authorized', {
        userId: decodedJwt.sub
    })
    
    return decodedJwt.sub
}

const getToken = (authHeader) => {
    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
