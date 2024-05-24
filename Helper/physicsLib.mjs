export function AABBCollisionPredicted(movingObj, other) {
    return movingObj.pos.x + movingObj.size.width + movingObj.velocity.x >= other.pos.x && movingObj.pos.x + movingObj.velocity.x <= other.pos.x + other.size.width && movingObj.pos.y + movingObj.size.height + movingObj.velocity.y >= other.pos.y && movingObj.pos.y + movingObj.velocity.y <= other.pos.y + other.size.height;
}


export function AABBCollision(obj1, obj2) {
    return obj1.pos.x + obj1.size.width >= obj2.pos.x && obj1.pos.x <= obj2.pos.x + obj2.size.width && obj1.pos.y + obj1.size.height >= obj2.pos.y && obj1.pos.y <= obj2.pos.y + obj2.size.height;
}


export function triangleRectCollision(triangle, rect) {
    let edges = triangle.getEdges();
    for (let edge of edges) {
        if (edge.x >= rect.pos.x && edge.x <= rect.pos.x + rect.size.width && edge.y >= rect.pos.y && edge.y <= rect.pos.y + rect.size.height) {
            return true;
        }
    }
    return false;
}


export function trianglePlayerCollision(triangle, player) {
    for (let edge of player.getEdges()) {
        if (pointInsideTriangle(edge, triangle.getEdges())) {
            return true;
        }
    }

    return triangleRectCollision(triangle, player);
}


export function pointInsideTriangle(point, triangle) {
    let area = 1 / 2 * (-triangle[1].y * triangle[2].x + triangle[0].y * (-triangle[1].x + triangle[2].x) + triangle[0].x * (triangle[1].y - triangle[2].y) + triangle[1].x * triangle[2].y);
    let s = 1 / (2 * area) * (triangle[0].y * triangle[2].x - triangle[0].x * triangle[2].y + (triangle[2].y - triangle[0].y) * point.x + (triangle[0].x - triangle[2].x) * point.y);
    let t = 1 / (2 * area) * (triangle[0].x * triangle[1].y - triangle[0].y * triangle[1].x + (triangle[0].y - triangle[1].y) * point.x + (triangle[1].x - triangle[0].x) * point.y);

    return s >= 0 && t >= 0 && 1 - s - t >= 0;
}


export function pointInsideRect(point, rect) {
    return point.x > rect.pos.x && point.x < rect.pos.x + rect.size.width && point.y > rect.pos.y && point.y < rect.pos.y + rect.size.height;
}


export function pointInsideCircle(point, circle) {
    return Math.sqrt(Math.pow(point.x - circle.pos.x, 2) + Math.pow(point.y - circle.pos.y, 2)) < circle.size.width;
}