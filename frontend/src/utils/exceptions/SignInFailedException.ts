class SignInFailedException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SignInFailedException";
    }
}

export default SignInFailedException;
