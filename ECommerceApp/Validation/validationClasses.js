



class ValidationError extends Error{
    constructor(message){
        super(message);
        this.name="ValidationError";
    }
}

class AuthError extends Error{
    constructor(message){
        super(message);
        this.name="AuthError";
    }
}

class UserNotFoundError extends Error{
    constructor(message){
        super(message);
        this.name="UserNotFoundError";
    }
}
class TokenNotFoundError extends Error{
    constructor(message){
        super(message);
        this.name="TokenNotFoundError";
    }
}

class EmailAlreadyVerifiedError extends Error{
    constructor(message){
        super(message);
        this.name="EmailAlreadyVerifiedError";
    }
}
class PasswordAlreadyVerifiedError extends Error{
    constructor(message){
        super(message);
        this.name="PasswordAlreadyVerifiedError";
    }
}


module.exports={
    ValidationError,
    AuthError,
    UserNotFoundError,
    EmailAlreadyVerifiedError,
    TokenNotFoundError,
    PasswordAlreadyVerifiedError
}