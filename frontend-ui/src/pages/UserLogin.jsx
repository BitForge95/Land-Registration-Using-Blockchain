import LoginView from '../components/auth/LoginView';

export default function UserLogin() {
  return (
    <LoginView 
      title="Citizen Access" 
      subtitle="Sign in to view your land records and initiate requests."
      idPlacholder="12-digit Aadhar Number"
      idLabel="Aadhar Number"
      isUserLogin={true}
    />
  );
}
