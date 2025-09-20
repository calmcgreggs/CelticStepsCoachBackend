import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignIn appearance={{elements : {footerAction__signUp : false}}}/>
      </div>
    </div>
  );
}
