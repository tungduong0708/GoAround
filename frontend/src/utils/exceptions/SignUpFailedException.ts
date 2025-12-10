class SignUpFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignUpFailedException";
  }
}

export default SignUpFailedException;
