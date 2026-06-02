const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // токена от хедъра (Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: "Нямате достъп! Липсва токен." 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Проверка дали токенът е валиден
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        
        req.user = decoded;
        
        next(); // заявката се пуска към контролера
    } catch (err) {
        return res.status(403).json({ 
            success: false, 
            message: "Невалиден или изтекъл токен!" 
        });
    }
};

// Middleware само за админи
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: "Достъпът е разрешен само за администратори!" 
        });
    }
};

module.exports = { authMiddleware, adminMiddleware };