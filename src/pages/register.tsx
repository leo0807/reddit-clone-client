import Head from 'next/head'
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Axios from 'axios';
import InputGroup from '../components/InputGroup';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useAuthState } from '../context/auth';
export default function Register() {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();
  const { authenticated } = useAuthState();
  authenticated && router.push('/');
  
  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&Cs' })
      return
    }
    try {
      const res = await Axios.post('/auth/register', {
         email, password, username
      });
      router.push('/login');
      console.log(res.data);
    } catch (error) {
      setErrors(error.response.data);
      console.log(errors)
    }

  }
  return (
    <div className="flex bg-white">
      <Head>
        <title>Regiter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen bg-center bg-cover w-36" style={{backgroundImage:"url('/images/bricks.jpg')"}}></div>
      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
          <p className="mb-10 text-xs">
            By continuing, you are agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={submitForm}>
            <div className="mb-6">
              <input type="checkbox" name="agreement"
                className="mr-1 cursor-pointer" id="agreement"
                checked={agreement}
                onChange={e => setAgreement(e.target.checked)}
              />
              <label htmlFor="agreement" className="text-xs cursor-pointer">I agree to get emails about cool stuff on Reddit</label>
              <small className="block font-medium text-red-600">{errors.agreement}</small>
            </div>
            <InputGroup type="email" className="mb-2" value={email} setValue={setEmail} placeholder="Email" error={errors.email} />
            <InputGroup type="text" className="mb-2" value={username} setValue={setUsername} placeholder="Username" error={errors.username} />
            <InputGroup type="password" className="mb-4" value={password} setValue={setPassword} placeholder="Password" error={errors.password} />
            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border-blue-500 rounded">Sign Up</button>
          </form>
          <small>
            Already a redditor?
            <Link href="/login">
              <a href="" className="ml-1 text-blue-500 uppercase">LOG IN</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  )
}
