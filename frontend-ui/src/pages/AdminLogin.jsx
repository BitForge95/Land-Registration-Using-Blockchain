import LoginView from '../components/auth/LoginView';

export default function AdminLogin() {
  return (
    <LoginView 
      title="Administrator Portal" 
      subtitle="Sign in with your government-issued credentials."
      idPlacholder="ADMIN-IDX-99"
      isUserLogin={false}
    />
  );
}
