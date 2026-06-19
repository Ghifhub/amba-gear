function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json({ error: message });
}

function handleRouteError(res, error) {
  return res.status(500).json({ error: error.message });
}

function sendNotFound(res, entity = 'Resource') {
  return res.status(404).json({ error: `${entity} not found` });
}

module.exports = { sendSuccess, sendError, handleRouteError, sendNotFound };
