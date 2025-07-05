import RegisterForm from '@/components/auth/RegisterForm';
import { GuestOnlyPage } from '@/components/auth/RouteGuard';

export default function RegisterPage() {
  return (
    <GuestOnlyPage>
      <RegisterForm />
    </GuestOnlyPage>
  );
}
