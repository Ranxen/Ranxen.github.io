export function AABBCollisionPredicted(movingObj, other) {
    return movingObj.pos.x + movingObj.size + movingObj.velocity.x >= other.pos.x && movingObj.pos.x + movingObj.velocity.x <= other.pos.x + other.size.width && movingObj.pos.y + movingObj.size + movingObj.velocity.y >= other.pos.y && movingObj.pos.y + movingObj.velocity.y <= other.pos.y + other.size.height;
}


export function AABBCollision(obj1, obj2) {
    return obj1.pos.x + obj1.size >= obj2.pos.x && obj1.pos.x <= obj2.pos.x + obj2.size.width && obj1.pos.y + obj1.size >= obj2.pos.y && obj1.pos.y <= obj2.pos.y + obj2.size.height;
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


export function intersects(vectorA1, vectorA2, vectorB1, vectorB2) {
    let s1_x = vectorA2.x - vectorA1.x;
    let s1_y = vectorA2.y - vectorA1.y;
    let s2_x = vectorB2.x - vectorB1.x;
    let s2_y = vectorB2.y - vectorB1.y;

    let s = (-s1_y * (vectorA1.x - vectorB1.x) + s1_x * (vectorA1.y - vectorB1.y)) / (-s2_x * s1_y + s1_x * s2_y);
    let t = (s2_x * (vectorA1.y - vectorB1.y) - s2_y * (vectorA1.x - vectorB1.x)) / (-s2_x * s1_y + s1_x * s2_y);

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}


export function trianglePlayerCollision(triangle, player) {
    for (let edge of player.getEdges()) {
        if (pointInsideTriangle(edge, triangle.getEdges())) {
            return true;
        }
    }

    return triangleRectCollision(triangle, { pos: player.pos, size: { width: player.size, height: player.size } });
}


export function pointInsideTriangle(point, triangle) {
    let area = 1 / 2 * (-triangle[1].y * triangle[2].x + triangle[0].y * (-triangle[1].x + triangle[2].x) + triangle[0].x * (triangle[1].y - triangle[2].y) + triangle[1].x * triangle[2].y);
    let s = 1 / (2 * area) * (triangle[0].y * triangle[2].x - triangle[0].x * triangle[2].y + (triangle[2].y - triangle[0].y) * point.x + (triangle[0].x - triangle[2].x) * point.y);
    let t = 1 / (2 * area) * (triangle[0].x * triangle[1].y - triangle[0].y * triangle[1].x + (triangle[0].y - triangle[1].y) * point.x + (triangle[1].x - triangle[0].x) * point.y);

    return s >= 0 && t >= 0 && 1 - s - t >= 0;
}