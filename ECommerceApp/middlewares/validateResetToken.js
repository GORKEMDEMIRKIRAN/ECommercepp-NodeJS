



// middleware olarak token kontrolü

const validateResetToken = async (req, res, next) => {
    try {
        const token = req.query.token || req.body.token;
        if (!token) {
            req.flash('error', 'Geçersiz token');
            return res.redirect('/auth/reset-password');
        }

        const user = await userRepository.findByResetPasswordToken(token);
        if (!user || user.passwordVerificationExpires < Date.now()) {
            req.flash('error', 'Geçersiz veya süresi dolmuş token');
            return res.redirect('/auth/reset-password');
        }

        req.user = user;
        next();
    } catch (error) {
        logger.logError(error, req);
        req.flash('error', 'Bir hata oluştu');
        res.redirect('/auth/reset-password');
    }
};
