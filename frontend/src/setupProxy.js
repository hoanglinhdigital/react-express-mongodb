const promClient = require('prom-client');

// Initialize default metrics collection
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

module.exports = function (app) {
    app.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', promClient.register.contentType);
            const metrics = await promClient.register.metrics();
            res.send(metrics);
        } catch (ex) {
            console.error("Error generating metrics", ex);
            res.status(500).send("Error generating metrics");
        }
    });
};
