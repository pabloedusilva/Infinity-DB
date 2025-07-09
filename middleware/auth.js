const db = require('../db/neon');

function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    
    // Para requisições API, retornar JSON ao invés de redirect
    if (req.path.startsWith('/api/') || req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'Please login to access this endpoint'
        });
    }
    
    return res.redirect('/dashboard/login');
}

module.exports = { requireLogin };