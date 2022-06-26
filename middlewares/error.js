module.exports = ((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        return res.status(500).send({ message: err.message });
    } else if (err) {
        return res.status(500).json({message: "An internal error occurred"});
    }
    next();
});