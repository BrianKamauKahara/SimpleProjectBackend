const path = require('path')


const paths = {
    static : path.resolve(__dirname,'..', 'public'),
    views : path.resolve(__dirname, '..', 'views'),
    routes : path.resolve(__dirname, '..', 'routes'),
    logs : path.resolve(__dirname, '..', 'logs'),
    middleware : path.resolve(__dirname, '..', 'middleware'),
    models: path.resolve(__dirname, '..', 'models'),
    controllers: path.resolve(__dirname, '..', 'controllers'),
    services: path.resolve(__dirname, '..', 'services'),
    subPaths (mainDir, ...pathList) {
         return path.resolve(this[mainDir],  ...pathList) 
    }
}

const pathFor = (...pathList) => {
    return paths.subPaths(pathList[0], ...pathList.slice(1))
}

module.exports = {
    paths,
    pathFor
}