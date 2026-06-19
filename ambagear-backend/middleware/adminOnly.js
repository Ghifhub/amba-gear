module.exports = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can perform this action' });
  }
  next();
};
