export function apiHandler(handler) {
  return async (req, res) => {
    try { await handler(req, res); }
    catch (error) { console.error(error); if (!res.headersSent) res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' }); }
  };
}
