import { LoginForm } from '@/components/auth/LoginForm';
import { GuestOnlyPage } from '@/components/auth/RouteGuard';

export default function LoginPage() {
  return (
    <GuestOnlyPage>
      <LoginForm />
    </GuestOnlyPage>
  );
}
