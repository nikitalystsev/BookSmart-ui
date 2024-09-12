export function isInternalServerError(response) {
    return !response.ok && response.status === 500;
}

export function isConflict(response) {
    return !response.ok && response.status === 409;
}

export function isBadRequest(response) {
    return !response.ok && response.status === 400;
}

export function isNotFound(response) {
    return !response.ok && response.status === 404;
}

export function isUnauthorized(response) {
    return !response.ok && response.status === 401;
}

export function isForbidden(response) {
    return !response.ok && response.status === 403;
}